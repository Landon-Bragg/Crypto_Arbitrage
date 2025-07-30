import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { exchangeService } from "./services/exchangeService";
import { filterArbitrageSchema } from "@shared/schema";
import { dynamicRateLimit } from "./auth"; // Only import dynamicRateLimit
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get arbitrage opportunities with optional filtering and dynamic rate limit
  app.get("/api/arbitrage", dynamicRateLimit, async (req, res) => {
    try {
      const { coin = "all", minSpread } = req.query;

      const validatedParams = filterArbitrageSchema.parse({
        coin,
        minSpread: minSpread !== undefined ? parseFloat(minSpread as string) : 0.1,
      });

      const opportunities = await storage.getArbitrageOpportunities(
        validatedParams.coin === "all" ? undefined : validatedParams.coin,
        validatedParams.minSpread
      );

      res.json(opportunities);
    } catch (error) {
      console.error("Error fetching arbitrage opportunities:", error);
      res.status(500).json({ message: "Failed to fetch arbitrage opportunities" });
    }
  });

  // Get latest exchange prices (removed auth middleware)
  app.get("/api/prices", async (req, res) => {
    try {
      const prices = await storage.getLatestExchangePrices();
      res.json(prices);
    } catch (error) {
      console.error("Error fetching exchange prices:", error);
      res.status(500).json({ message: "Failed to fetch exchange prices" });
    }
  });

  // Manually trigger price update
  app.post("/api/update-prices", async (req, res) => {
    try {
      await exchangeService.updateAllPrices();
      res.json({ message: "Prices updated successfully" });
    } catch (error) {
      console.error("Error updating prices:", error);
      res.status(500).json({ message: "Failed to update prices" });
    }
  });

  // Get statistics
  app.get("/api/statistics", async (req, res) => {
    try {
      const opportunities = await storage.getArbitrageOpportunities();
      const activeOpportunities = opportunities.length;
      const highestSpread = opportunities.length > 0 
        ? Math.max(...opportunities.map(op => parseFloat(op.spread)))
        : 0;

      // Find most recent opportunity for last alert time
      const mostRecent = opportunities.length > 0 ? opportunities[0] : null;
      const lastAlertTime = mostRecent 
        ? new Date(mostRecent.timestamp).toLocaleTimeString()
        : undefined;

      res.json({
        activeOpportunities,
        highestSpread: parseFloat(highestSpread.toFixed(2)),
        lastAlertTime,
      });
    } catch (error) {
      console.error("Error fetching statistics:", error);
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });

  // Start periodic price updates
  const startPeriodicUpdates = () => {
    // Initial update
    exchangeService.updateAllPrices().catch(console.error);
    
    // Update every 5 seconds
    setInterval(() => {
      exchangeService.updateAllPrices().catch(console.error);
    }, 5000);
  };

  // Start the periodic updates
  startPeriodicUpdates();

  const httpServer = createServer(app);
  return httpServer;
}
