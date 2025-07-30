import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, timestamp, integer, boolean, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const arbitrageOpportunities = pgTable("arbitrage_opportunities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  coin: text("coin").notNull(),
  buyExchange: text("buy_exchange").notNull(),
  buyPrice: decimal("buy_price", { precision: 20, scale: 8 }).notNull(),
  sellExchange: text("sell_exchange").notNull(),
  sellPrice: decimal("sell_price", { precision: 20, scale: 8 }).notNull(),
  spread: decimal("spread", { precision: 10, scale: 4 }).notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
}, (table) => ({
  // prevent duplicates for the same coin/exchange combination
  uniqueOpportunity: unique("unique_coin_buy_sell").on(table.coin, table.buyExchange, table.sellExchange),
}));

export const exchangePrices = pgTable("exchange_prices", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  exchange: text("exchange").notNull(),
  coin: text("coin").notNull(),
  price: decimal("price", { precision: 20, scale: 8 }).notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const users = pgTable("users", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  username: varchar("username", { length: 255 }).notNull().unique(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  lastApiCall: timestamp("last_api_call"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertArbitrageOpportunitySchema = createInsertSchema(arbitrageOpportunities).omit({
  id: true,
  timestamp: true,
});

export const insertExchangePriceSchema = createInsertSchema(exchangePrices).omit({
  id: true,
  timestamp: true,
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertArbitrageOpportunity = z.infer<typeof insertArbitrageOpportunitySchema>;
export type ArbitrageOpportunity = typeof arbitrageOpportunities.$inferSelect;
export type InsertExchangePrice = z.infer<typeof insertExchangePriceSchema>;
export type ExchangePrice = typeof exchangePrices.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Frontend types for API responses
export const filterArbitrageSchema = z.object({
  coin: z.enum(["all", "BTC", "ETH", "ADA", "SOL", "DOT", "LINK", "XRP", "ATOM"]).default("all"),
  minSpread: z.number().min(0).default(0.1),
});

export type FilterArbitrageParams = z.infer<typeof filterArbitrageSchema>;

export const statisticsSchema = z.object({
  activeOpportunities: z.number(),
  highestSpread: z.number(),
  lastAlertTime: z.string().optional(),
});

export type Statistics = z.infer<typeof statisticsSchema>;