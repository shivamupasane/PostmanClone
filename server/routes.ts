import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCollectionSchema, insertRequestSchema, insertHistorySchema } from "../shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Collections routes
  app.get("/api/collections", async (req, res) => {
    try {
      const collections = await storage.getCollections();
      res.json(collections);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch collections" });
    }
  });

  app.post("/api/collections", async (req, res) => {
    try {
      const validation = insertCollectionSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ message: "Invalid collection data", errors: validation.error.errors });
      }
      const collection = await storage.createCollection(validation.data);
      res.status(201).json(collection);
    } catch (error) {
      res.status(500).json({ message: "Failed to create collection" });
    }
  });

  app.delete("/api/collections/:id", async (req, res) => {
    try {
      await storage.deleteCollection(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete collection" });
    }
  });

  // Requests routes
  app.get("/api/collections/:collectionId/requests", async (req, res) => {
    try {
      const requests = await storage.getRequestsByCollection(req.params.collectionId);
      res.json(requests);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch requests" });
    }
  });

  app.post("/api/requests", async (req, res) => {
    try {
      const validation = insertRequestSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ message: "Invalid request data", errors: validation.error.errors });
      }
      const request = await storage.createRequest(validation.data);
      res.status(201).json(request);
    } catch (error) {
      res.status(500).json({ message: "Failed to create request" });
    }
  });

  app.put("/api/requests/:id", async (req, res) => {
    try {
      const validation = insertRequestSchema.partial().safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ message: "Invalid request data", errors: validation.error.errors });
      }
      const request = await storage.updateRequest(req.params.id, validation.data);
      res.json(request);
    } catch (error) {
      res.status(500).json({ message: "Failed to update request" });
    }
  });

  app.delete("/api/requests/:id", async (req, res) => {
    try {
      await storage.deleteRequest(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete request" });
    }
  });

  // History routes
  app.get("/api/history", async (req, res) => {
    try {
      const history = await storage.getHistory();
      res.json(history);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch history" });
    }
  });

  app.post("/api/history", async (req, res) => {
    try {
      const validation = insertHistorySchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ message: "Invalid history data", errors: validation.error.errors });
      }
      const history = await storage.addToHistory(validation.data);
      res.status(201).json(history);
    } catch (error) {
      res.status(500).json({ message: "Failed to add to history" });
    }
  });

  app.delete("/api/history", async (req, res) => {
    try {
      await storage.clearHistory();
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to clear history" });
    }
  });

  // Proxy endpoint for making HTTP requests
  app.post("/api/proxy", async (req, res) => {
    try {
      const { method, url, headers, body } = req.body;
      
      const startTime = Date.now();
      
      const response = await fetch(url, {
        method,
        headers: headers || {},
        body: body ? JSON.stringify(body) : undefined,
      });
      
      const endTime = Date.now();
      const responseTime = `${endTime - startTime}ms`;
      
      const responseText = await response.text();
      let responseBody;
      try {
        responseBody = JSON.parse(responseText);
      } catch {
        responseBody = responseText;
      }
      
      const responseSize = `${new Blob([responseText]).size} bytes`;
      
      res.json({
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        body: responseBody,
        time: responseTime,
        size: responseSize,
      });
    } catch (error) {
      res.status(500).json({ 
        message: "Request failed", 
        error: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
