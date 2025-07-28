import { type ArbitrageOpportunity, type InsertArbitrageOpportunity, type ExchangePrice, type InsertExchangePrice } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Arbitrage opportunities
  getArbitrageOpportunities(coin?: string, minSpread?: number): Promise<ArbitrageOpportunity[]>;
  createArbitrageOpportunity(opportunity: InsertArbitrageOpportunity): Promise<ArbitrageOpportunity>;
  clearOldArbitrageOpportunities(): Promise<void>;
  
  // Exchange prices
  getLatestExchangePrices(): Promise<ExchangePrice[]>;
  createExchangePrice(price: InsertExchangePrice): Promise<ExchangePrice>;
  getExchangePrice(exchange: string, coin: string): Promise<ExchangePrice | undefined>;
}

export class MemStorage implements IStorage {
  private arbitrageOpportunities: Map<string, ArbitrageOpportunity>;
  private exchangePrices: Map<string, ExchangePrice>;

  constructor() {
    this.arbitrageOpportunities = new Map();
    this.exchangePrices = new Map();
  }

  async getArbitrageOpportunities(coin?: string, minSpread?: number): Promise<ArbitrageOpportunity[]> {
    let opportunities = Array.from(this.arbitrageOpportunities.values());
    
    if (coin && coin !== "all") {
      opportunities = opportunities.filter(op => op.coin === coin);
    }
    
    if (minSpread !== undefined) {
      opportunities = opportunities.filter(op => parseFloat(op.spread) >= minSpread);
    }
    
    // Sort by spread descending, then by timestamp descending
    return opportunities.sort((a, b) => {
      const spreadDiff = parseFloat(b.spread) - parseFloat(a.spread);
      if (spreadDiff !== 0) return spreadDiff;
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });
  }

  async createArbitrageOpportunity(insertOpportunity: InsertArbitrageOpportunity): Promise<ArbitrageOpportunity> {
    const id = randomUUID();
    const opportunity: ArbitrageOpportunity = {
      ...insertOpportunity,
      id,
      timestamp: new Date(),
    };
    this.arbitrageOpportunities.set(id, opportunity);
    return opportunity;
  }

  async clearOldArbitrageOpportunities(): Promise<void> {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    
    for (const [id, opportunity] of this.arbitrageOpportunities.entries()) {
      if (new Date(opportunity.timestamp) < fiveMinutesAgo) {
        this.arbitrageOpportunities.delete(id);
      }
    }
  }

  async getLatestExchangePrices(): Promise<ExchangePrice[]> {
    return Array.from(this.exchangePrices.values());
  }

  async createExchangePrice(insertPrice: InsertExchangePrice): Promise<ExchangePrice> {
    const id = randomUUID();
    const price: ExchangePrice = {
      ...insertPrice,
      id,
      timestamp: new Date(),
    };
    
    // Use a composite key to store latest price for each exchange-coin pair
    const key = `${insertPrice.exchange}-${insertPrice.coin}`;
    this.exchangePrices.set(key, price);
    return price;
  }

  async getExchangePrice(exchange: string, coin: string): Promise<ExchangePrice | undefined> {
    const key = `${exchange}-${coin}`;
    return this.exchangePrices.get(key);
  }
}

export const storage = new MemStorage();
