import { db } from "./db";
import { eq, and, desc, asc, ilike, or } from "drizzle-orm";
import * as schema from "@shared/schema";
import type {
  User, InsertUser,
  AuthCode, InsertAuthCode,
  Listing, InsertListing,
  Conversation, InsertConversation,
  Message, InsertMessage,
  DealListener, InsertDealListener,
  SavedListing, InsertSavedListing
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByPhone(phoneNumber: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User>;
  
  // Auth Codes
  createAuthCode(authCode: InsertAuthCode): Promise<AuthCode>;
  getActiveAuthCode(phoneNumber: string, code: string): Promise<AuthCode | undefined>;
  verifyAuthCode(id: string): Promise<void>;
  
  // Listings
  createListing(listing: InsertListing): Promise<Listing>;
  getListing(id: string): Promise<Listing | undefined>;
  getListings(filters?: { category?: string; search?: string; sellerId?: string }): Promise<Listing[]>;
  updateListing(id: string, updates: Partial<Listing>): Promise<Listing>;
  deleteListing(id: string): Promise<void>;
  incrementViews(id: string): Promise<void>;
  
  // Conversations
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  getConversation(id: string): Promise<Conversation | undefined>;
  getConversationsByUser(userId: string): Promise<Conversation[]>;
  updateConversation(id: string, updates: Partial<Conversation>): Promise<Conversation>;
  
  // Messages
  createMessage(message: InsertMessage): Promise<Message>;
  getMessagesByConversation(conversationId: string): Promise<Message[]>;
  
  // Deal Listeners
  createDealListener(listener: InsertDealListener): Promise<DealListener>;
  getDealListenersByUser(userId: string): Promise<DealListener[]>;
  updateDealListener(id: string, updates: Partial<DealListener>): Promise<DealListener>;
  deleteDealListener(id: string): Promise<void>;
  
  // Saved Listings
  saveListing(userId: string, listingId: string): Promise<SavedListing>;
  unsaveListing(userId: string, listingId: string): Promise<void>;
  getSavedListings(userId: string): Promise<Listing[]>;
  isListingSaved(userId: string, listingId: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(schema.users).where(eq(schema.users.id, id));
    return user;
  }

  async getUserByPhone(phoneNumber: string): Promise<User | undefined> {
    const [user] = await db.select().from(schema.users).where(eq(schema.users.phoneNumber, phoneNumber));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(schema.users).values(user).returning();
    return newUser;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const [updated] = await db.update(schema.users).set(updates).where(eq(schema.users.id, id)).returning();
    return updated;
  }

  // Auth Codes
  async createAuthCode(authCode: InsertAuthCode): Promise<AuthCode> {
    const [code] = await db.insert(schema.authCodes).values(authCode).returning();
    return code;
  }

  async getActiveAuthCode(phoneNumber: string, code: string): Promise<AuthCode | undefined> {
    const [authCode] = await db.select().from(schema.authCodes).where(
      and(
        eq(schema.authCodes.phoneNumber, phoneNumber),
        eq(schema.authCodes.code, code),
        eq(schema.authCodes.verified, false)
      )
    );
    
    if (!authCode || new Date() > authCode.expiresAt) {
      return undefined;
    }
    
    return authCode;
  }

  async verifyAuthCode(id: string): Promise<void> {
    await db.update(schema.authCodes).set({ verified: true }).where(eq(schema.authCodes.id, id));
  }

  // Listings
  async createListing(listing: InsertListing): Promise<Listing> {
    const [newListing] = await db.insert(schema.listings).values(listing).returning();
    return newListing;
  }

  async getListing(id: string): Promise<Listing | undefined> {
    const [listing] = await db.select().from(schema.listings).where(eq(schema.listings.id, id));
    return listing;
  }

  async getListings(filters?: { category?: string; search?: string; sellerId?: string }): Promise<Listing[]> {
    let query = db.select().from(schema.listings).where(eq(schema.listings.status, "active"));
    
    const conditions = [eq(schema.listings.status, "active")];
    
    if (filters?.category) {
      conditions.push(eq(schema.listings.category, filters.category));
    }
    
    if (filters?.sellerId) {
      conditions.push(eq(schema.listings.sellerId, filters.sellerId));
    }
    
    if (filters?.search) {
      conditions.push(
        or(
          ilike(schema.listings.title, `%${filters.search}%`),
          ilike(schema.listings.description, `%${filters.search}%`)
        )!
      );
    }
    
    return db.select().from(schema.listings).where(and(...conditions)).orderBy(desc(schema.listings.createdAt));
  }

  async updateListing(id: string, updates: Partial<Listing>): Promise<Listing> {
    const [updated] = await db.update(schema.listings)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(schema.listings.id, id))
      .returning();
    return updated;
  }

  async deleteListing(id: string): Promise<void> {
    await db.update(schema.listings).set({ status: "deleted" }).where(eq(schema.listings.id, id));
  }

  async incrementViews(id: string): Promise<void> {
    await db.execute(
      `UPDATE listings SET views = views + 1 WHERE id = ${id}`
    );
  }

  // Conversations
  async createConversation(conversation: InsertConversation): Promise<Conversation> {
    const [newConversation] = await db.insert(schema.conversations).values(conversation).returning();
    return newConversation;
  }

  async getConversation(id: string): Promise<Conversation | undefined> {
    const [conversation] = await db.select().from(schema.conversations).where(eq(schema.conversations.id, id));
    return conversation;
  }

  async getConversationsByUser(userId: string): Promise<Conversation[]> {
    return db.select().from(schema.conversations).where(
      or(
        eq(schema.conversations.buyerId, userId),
        eq(schema.conversations.sellerId, userId)
      )!
    ).orderBy(desc(schema.conversations.lastMessageAt));
  }

  async updateConversation(id: string, updates: Partial<Conversation>): Promise<Conversation> {
    const [updated] = await db.update(schema.conversations).set(updates).where(eq(schema.conversations.id, id)).returning();
    return updated;
  }

  // Messages
  async createMessage(message: InsertMessage): Promise<Message> {
    const [newMessage] = await db.insert(schema.messages).values(message).returning();
    
    // Update conversation's lastMessageAt
    await db.update(schema.conversations)
      .set({ lastMessageAt: new Date() })
      .where(eq(schema.conversations.id, message.conversationId));
    
    return newMessage;
  }

  async getMessagesByConversation(conversationId: string): Promise<Message[]> {
    return db.select().from(schema.messages)
      .where(eq(schema.messages.conversationId, conversationId))
      .orderBy(asc(schema.messages.createdAt));
  }

  // Deal Listeners
  async createDealListener(listener: InsertDealListener): Promise<DealListener> {
    const [newListener] = await db.insert(schema.dealListeners).values(listener).returning();
    return newListener;
  }

  async getDealListenersByUser(userId: string): Promise<DealListener[]> {
    return db.select().from(schema.dealListeners)
      .where(and(eq(schema.dealListeners.userId, userId), eq(schema.dealListeners.active, true)))
      .orderBy(desc(schema.dealListeners.createdAt));
  }

  async updateDealListener(id: string, updates: Partial<DealListener>): Promise<DealListener> {
    const [updated] = await db.update(schema.dealListeners).set(updates).where(eq(schema.dealListeners.id, id)).returning();
    return updated;
  }

  async deleteDealListener(id: string): Promise<void> {
    await db.update(schema.dealListeners).set({ active: false }).where(eq(schema.dealListeners.id, id));
  }

  // Saved Listings
  async saveListing(userId: string, listingId: string): Promise<SavedListing> {
    const [saved] = await db.insert(schema.savedListings).values({ userId, listingId }).returning();
    
    // Increment saves count
    await db.execute(
      `UPDATE listings SET saves = saves + 1 WHERE id = '${listingId}'`
    );
    
    return saved;
  }

  async unsaveListing(userId: string, listingId: string): Promise<void> {
    await db.delete(schema.savedListings).where(
      and(
        eq(schema.savedListings.userId, userId),
        eq(schema.savedListings.listingId, listingId)
      )
    );
    
    // Decrement saves count
    await db.execute(
      `UPDATE listings SET saves = GREATEST(0, saves - 1) WHERE id = '${listingId}'`
    );
  }

  async getSavedListings(userId: string): Promise<Listing[]> {
    const saved = await db.select({
      listing: schema.listings
    })
      .from(schema.savedListings)
      .innerJoin(schema.listings, eq(schema.savedListings.listingId, schema.listings.id))
      .where(eq(schema.savedListings.userId, userId))
      .orderBy(desc(schema.savedListings.createdAt));
    
    return saved.map(s => s.listing);
  }

  async isListingSaved(userId: string, listingId: string): Promise<boolean> {
    const [saved] = await db.select().from(schema.savedListings).where(
      and(
        eq(schema.savedListings.userId, userId),
        eq(schema.savedListings.listingId, listingId)
      )
    );
    return !!saved;
  }
}

export const storage = new DatabaseStorage();
