import { type Collection, type InsertCollection, type Request, type InsertRequest, type History, type InsertHistory } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Collections
  getCollections(): Promise<Collection[]>;
  getCollection(id: string): Promise<Collection | undefined>;
  createCollection(collection: InsertCollection): Promise<Collection>;
  deleteCollection(id: string): Promise<void>;

  // Requests
  getRequestsByCollection(collectionId: string): Promise<Request[]>;
  getRequest(id: string): Promise<Request | undefined>;
  createRequest(request: InsertRequest): Promise<Request>;
  updateRequest(id: string, request: Partial<InsertRequest>): Promise<Request>;
  deleteRequest(id: string): Promise<void>;

  // History
  getHistory(): Promise<History[]>;
  addToHistory(history: InsertHistory): Promise<History>;
  clearHistory(): Promise<void>;
}

export class MemStorage implements IStorage {
  private collections: Map<string, Collection>;
  private requests: Map<string, Request>;
  private history: Map<string, History>;

  constructor() {
    this.collections = new Map();
    this.requests = new Map();
    this.history = new Map();
  }

  async getCollections(): Promise<Collection[]> {
    return Array.from(this.collections.values());
  }

  async getCollection(id: string): Promise<Collection | undefined> {
    return this.collections.get(id);
  }

  async createCollection(insertCollection: InsertCollection): Promise<Collection> {
    const id = randomUUID();
    const collection: Collection = {
      ...insertCollection,
      id,
      createdAt: new Date(),
    };
    this.collections.set(id, collection);
    return collection;
  }

  async deleteCollection(id: string): Promise<void> {
    this.collections.delete(id);
    // Also delete all requests in this collection
    for (const [requestId, request] of this.requests.entries()) {
      if (request.collectionId === id) {
        this.requests.delete(requestId);
      }
    }
  }

  async getRequestsByCollection(collectionId: string): Promise<Request[]> {
    return Array.from(this.requests.values()).filter(
      (request) => request.collectionId === collectionId
    );
  }

  async getRequest(id: string): Promise<Request | undefined> {
    return this.requests.get(id);
  }

  async createRequest(insertRequest: InsertRequest): Promise<Request> {
    const id = randomUUID();
    const request: Request = {
      ...insertRequest,
      id,
      createdAt: new Date(),
    };
    this.requests.set(id, request);
    return request;
  }

  async updateRequest(id: string, updateData: Partial<InsertRequest>): Promise<Request> {
    const existing = this.requests.get(id);
    if (!existing) {
      throw new Error(`Request with id ${id} not found`);
    }
    const updated: Request = { ...existing, ...updateData };
    this.requests.set(id, updated);
    return updated;
  }

  async deleteRequest(id: string): Promise<void> {
    this.requests.delete(id);
  }

  async getHistory(): Promise<History[]> {
    return Array.from(this.history.values()).sort(
      (a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    );
  }

  async addToHistory(insertHistory: InsertHistory): Promise<History> {
    const id = randomUUID();
    const history: History = {
      ...insertHistory,
      id,
      createdAt: new Date(),
    };
    this.history.set(id, history);
    return history;
  }

  async clearHistory(): Promise<void> {
    this.history.clear();
  }
}

export const storage = new MemStorage();
