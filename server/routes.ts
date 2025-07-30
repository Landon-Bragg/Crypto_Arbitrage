import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { exchangeService } from "./services/exchangeService";
import { filterArbitrageSchema, insertUserSchema } from "@shared/schema";
import { authenticateToken, optionalAuth, createToken, hashPassword, comparePassword, type AuthRequest, dynamicRateLimit } from "./auth"; // Add dynamicRateLimit import
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  const loginSchema = z.object({
    username: z.string(),
    password: z.string(),
  });

  const registerSchema = insertUserSchema.extend({
    password: z.string().min(6),
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const validatedData = registerSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(validatedData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const existingEmail = await storage.getUserByEmail(validatedData.email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }

      // Hash password and create user
      const hashedPassword = await hashPassword(validatedData.password);
      const newUser = await storage.createUser({
        username: validatedData.username,
        email: validatedData.email,
        passwordHash: hashedPassword,
      });

      // Create token
      const token = createToken({
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
      });

      res.status(201).json({ 
        message: "User created successfully", 
        token,
        user: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
        }
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(400).json({ message: "Registration failed" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const validatedData = loginSchema.parse(req.body);
      
      const user = await storage.getUserByUsername(validatedData.username);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isValidPassword = await comparePassword(validatedData.password, user.passwordHash);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = createToken({
        id: user.id,
        username: user.username,
        email: user.email,
      });

      res.json({ 
        message: "Login successful", 
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
        }
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(400).json({ message: "Login failed" });
    }
  });

  app.get("/api/auth/me", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const user = await storage.getUser(req.user!.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({
        id: user.id,
        username: user.username,
        email: user.email,
      });
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Failed to get user" });
    }
  });

  // Get arbitrage opportunities with optional filtering and dynamic rate limit
  app.get("/api/arbitrage", dynamicRateLimit, optionalAuth, async (req: AuthRequest, res) => {
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

  // Get latest exchange prices
  app.get("/api/prices", optionalAuth, async (req: AuthRequest, res) => {
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
