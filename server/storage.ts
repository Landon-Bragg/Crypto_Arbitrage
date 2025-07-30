import { type ArbitrageOpportunity, type InsertArbitrageOpportunity, type ExchangePrice, type InsertExchangePrice, arbitrageOpportunities, exchangePrices } from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./db";
import { eq, and, desc, gte, lt, sql } from "drizzle-orm";

export interface IStorage {
  // Arbitrage opportunities
  getArbitrageOpportunities(coin?: string, minSpread?: number): Promise<ArbitrageOpportunity[]>;
  createArbitrageOpportunity(opportunity: InsertArbitrageOpportunity): Promise<ArbitrageOpportunity>;
  clearOldArbitrageOpportunities(): Promise<void>;
  
  // Exchange prices
  getLatestExchangePrices(): Promise<ExchangePrice[]>;
  createExchangePrice(price: InsertExchangePrice): Promise<ExchangePrice>;
  getExchangePrice(exchange: string, coin: string): Promise<ExchangePrice | undefined>;
  // Removed user management functions
}

// Database storage implementation
export class DatabaseStorage implements IStorage {
  async getArbitrageOpportunities(coin?: string, minSpread?: number): Promise<ArbitrageOpportunity[]> {
    let query = db.select().from(arbitrageOpportunities);
    
    const conditions = [];
    if (coin && coin !== "all") {
      conditions.push(eq(arbitrageOpportunities.coin, coin));
    }
    if (minSpread !== undefined) {
      conditions.push(gte(arbitrageOpportunities.spread, minSpread.toString()));
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    const results = await query.orderBy(desc(arbitrageOpportunities.spread), desc(arbitrageOpportunities.timestamp));
    return results;
  }

  async createArbitrageOpportunity(insertOpportunity: InsertArbitrageOpportunity): Promise<ArbitrageOpportunity> {
    // First, try to delete any existing opportunity with the same coin/exchange combination
    // This handles the "upsert" behavior without relying on database constraints
    try {
      await db
        .delete(arbitrageOpportunities)
        .where(and(
          eq(arbitrageOpportunities.coin, insertOpportunity.coin),
          eq(arbitrageOpportunities.buyExchange, insertOpportunity.buyExchange),
          eq(arbitrageOpportunities.sellExchange, insertOpportunity.sellExchange)
        ));
    } catch (error) {
      // Ignore delete errors - the record might not exist
      console.log(`No existing opportunity to delete for ${insertOpportunity.coin} ${insertOpportunity.buyExchange}->${insertOpportunity.sellExchange}`);
    }

    // Now insert the new opportunity
    const [opportunity] = await db
      .insert(arbitrageOpportunities)
      .values(insertOpportunity)
      .returning();
    
    return opportunity;
  }

  async clearOldArbitrageOpportunities(): Promise<void> {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    await db
      .delete(arbitrageOpportunities)
      .where(lt(arbitrageOpportunities.timestamp, fiveMinutesAgo));
  }

  async getLatestExchangePrices(): Promise<ExchangePrice[]> {
    const results = await db.select().from(exchangePrices).orderBy(desc(exchangePrices.timestamp));
    return results;
  }

  async createExchangePrice(insertPrice: InsertExchangePrice): Promise<ExchangePrice> {
    // Delete existing price for this exchange-coin pair first
    await db
      .delete(exchangePrices)
      .where(and(
        eq(exchangePrices.exchange, insertPrice.exchange),
        eq(exchangePrices.coin, insertPrice.coin)
      ));
    
    const [price] = await db
      .insert(exchangePrices)
      .values(insertPrice)
      .returning();
    return price;
  }

  async getExchangePrice(exchange: string, coin: string): Promise<ExchangePrice | undefined> {
    const [price] = await db
      .select()
      .from(exchangePrices)
      .where(and(
        eq(exchangePrices.exchange, exchange),
        eq(exchangePrices.coin, coin)
      ));
    return price || undefined;
  }
}

export const storage = new DatabaseStorage();