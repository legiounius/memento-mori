import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.post(api.users.create.path, async (req, res) => {
    try {
      const input = api.users.create.input.parse(req.body);
      const user = await storage.createUser(input);
      res.status(201).json(user);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.post("/api/tracker/increment", async (_req, res) => {
    try {
      const count = await storage.incrementTracker();
      res.json({ count });
    } catch (err) {
      console.error("Tracker increment error:", err);
      res.status(500).json({ message: "Failed to increment tracker" });
    }
  });

  app.get("/api/tracker/count", async (_req, res) => {
    try {
      const count = await storage.getTrackerCount();
      res.json({ count });
    } catch (err) {
      console.error("Tracker count error:", err);
      res.status(500).json({ message: "Failed to get tracker count" });
    }
  });

  return httpServer;
}
