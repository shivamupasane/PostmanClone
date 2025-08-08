import { sql } from "drizzle-orm";
import { pgTable, text, varchar, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const collections = pgTable("collections", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const requests = pgTable("requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  collectionId: varchar("collection_id").references(() => collections.id),
  name: text("name").notNull(),
  method: text("method").notNull(),
  url: text("url").notNull(),
  headers: jsonb("headers").default({}),
  params: jsonb("params").default({}),
  body: text("body"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const requestHistory = pgTable("request_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  method: text("method").notNull(),
  url: text("url").notNull(),
  headers: jsonb("headers").default({}),
  params: jsonb("params").default({}),
  body: text("body"),
  responseStatus: text("response_status"),
  responseTime: text("response_time"),
  responseSize: text("response_size"),
  responseBody: text("response_body"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCollectionSchema = createInsertSchema(collections).omit({
  id: true,
  createdAt: true,
});

export const insertRequestSchema = createInsertSchema(requests).omit({
  id: true,
  createdAt: true,
});

export const insertHistorySchema = createInsertSchema(requestHistory).omit({
  id: true,
  createdAt: true,
});

export type InsertCollection = z.infer<typeof insertCollectionSchema>;
export type Collection = typeof collections.$inferSelect;

export type InsertRequest = z.infer<typeof insertRequestSchema>;
export type Request = typeof requests.$inferSelect;

export type InsertHistory = z.infer<typeof insertHistorySchema>;
export type History = typeof requestHistory.$inferSelect;
