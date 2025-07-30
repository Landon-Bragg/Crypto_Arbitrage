import { type ArbitrageOpportunity, type InsertArbitrageOpportunity, type ExchangePrice, type InsertExchangePrice, type User, type InsertUser, arbitrageOpportunities, exchangePrices, users } from "@shared/schema";
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
  
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(insertUser: InsertUser): Promise<User>;
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
    // Using raw SQL for proper upsert with ON CONFLICT
    const [opportunity] = await db
      .insert(arbitrageOpportunities)
      .values(insertOpportunity)
      .onConflictDoUpdate({
        target: [
          arbitrageOpportunities.coin,
          arbitrageOpportunities.buyExchange,
          arbitrageOpportunities.sellExchange
        ],
        set: {
          buyPrice: insertOpportunity.buyPrice,
          sellPrice: insertOpportunity.sellPrice,
          spread: insertOpportunity.spread,
          timestamp: sql`now()`,
        },
      })
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

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }
}

export const storage = new DatabaseStorage();