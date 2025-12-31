import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table - phone-based authentication
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  phoneNumber: varchar("phone_number", { length: 20 }).notNull().unique(),
  name: text("name"),
  avatarUrl: text("avatar_url"),
  isPremium: boolean("is_premium").default(false).notNull(),
  premiumExpiresAt: timestamp("premium_expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Auth codes for OTP verification
export const authCodes = pgTable("auth_codes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  phoneNumber: varchar("phone_number", { length: 20 }).notNull(),
  code: varchar("code", { length: 6 }).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  verified: boolean("verified").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAuthCodeSchema = createInsertSchema(authCodes).omit({
  id: true,
  createdAt: true,
  verified: true,
});

export type InsertAuthCode = z.infer<typeof insertAuthCodeSchema>;
export type AuthCode = typeof authCodes.$inferSelect;

// Listings
export const listings = pgTable("listings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sellerId: varchar("seller_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  condition: varchar("condition", { length: 50 }).notNull(),
  price: integer("price").notNull(),
  originalPrice: integer("original_price"),
  images: text("images").array().notNull(),
  location: text("location").notNull(),
  specs: jsonb("specs"),
  dealScore: integer("deal_score"),
  riskScore: integer("risk_score"),
  aiGenerated: jsonb("ai_generated").default({}),
  status: varchar("status", { length: 20 }).default("active").notNull(),
  views: integer("views").default(0).notNull(),
  saves: integer("saves").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertListingSchema = createInsertSchema(listings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  views: true,
  saves: true,
});

export type InsertListing = z.infer<typeof insertListingSchema>;
export type Listing = typeof listings.$inferSelect;

// Messages
export const conversations = pgTable("conversations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  listingId: varchar("listing_id").notNull().references(() => listings.id),
  buyerId: varchar("buyer_id").notNull().references(() => users.id),
  sellerId: varchar("seller_id").notNull().references(() => users.id),
  aiAgentActive: boolean("ai_agent_active").default(true).notNull(),
  needsIntervention: boolean("needs_intervention").default(false).notNull(),
  interventionReason: text("intervention_reason"),
  lastMessageAt: timestamp("last_message_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertConversationSchema = createInsertSchema(conversations).omit({
  id: true,
  createdAt: true,
  lastMessageAt: true,
});

export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Conversation = typeof conversations.$inferSelect;

export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  conversationId: varchar("conversation_id").notNull().references(() => conversations.id),
  senderId: varchar("sender_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  isAiGenerated: boolean("is_ai_generated").default(false).notNull(),
  status: varchar("status", { length: 20 }).default("sent").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

// Deal Listeners (Premium feature)
export const dealListeners = pgTable("deal_listeners", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  category: varchar("category", { length: 100 }).notNull(),
  keywords: text("keywords").array(),
  maxPrice: integer("max_price"),
  minDealScore: integer("min_deal_score").default(75),
  notifyWhatsApp: boolean("notify_whatsapp").default(true).notNull(),
  notifyEmail: boolean("notify_email").default(false).notNull(),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertDealListenerSchema = createInsertSchema(dealListeners).omit({
  id: true,
  createdAt: true,
});

export type InsertDealListener = z.infer<typeof insertDealListenerSchema>;
export type DealListener = typeof dealListeners.$inferSelect;

// Saved listings
export const savedListings = pgTable("saved_listings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  listingId: varchar("listing_id").notNull().references(() => listings.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertSavedListingSchema = createInsertSchema(savedListings).omit({
  id: true,
  createdAt: true,
});

export type InsertSavedListing = z.infer<typeof insertSavedListingSchema>;
export type SavedListing = typeof savedListings.$inferSelect;
