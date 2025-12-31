import type { Express } from "express";
import { type Server } from "http";
import { storage } from "./storage";
import { aiService } from "./ai-service";
import { z } from "zod";
import { insertUserSchema, insertAuthCodeSchema, insertListingSchema, insertMessageSchema, insertDealListenerSchema } from "@shared/schema";
import "./types";

// Helper to generate random 4-digit OTP
function generateOTP(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // ============= AUTH ROUTES =============
  
  // Request OTP for phone number
  app.post("/api/auth/request-otp", async (req, res) => {
    try {
      const { phoneNumber } = z.object({ phoneNumber: z.string() }).parse(req.body);
      
      // Generate OTP (in production, send via SMS)
      const code = generateOTP();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
      
      await storage.createAuthCode({ phoneNumber, code, expiresAt });
      
      // In development, return the code (in production, send via SMS and don't return it)
      console.log(`OTP for ${phoneNumber}: ${code}`);
      
      res.json({ 
        success: true, 
        message: "OTP sent successfully",
        // Only for development - remove in production
        devCode: process.env.NODE_ENV === "development" ? code : undefined
      });
    } catch (error) {
      console.error("Error requesting OTP:", error);
      res.status(400).json({ error: "Invalid request" });
    }
  });
  
  // Verify OTP and create session
  app.post("/api/auth/verify-otp", async (req, res) => {
    try {
      const { phoneNumber, code } = z.object({ 
        phoneNumber: z.string(),
        code: z.string()
      }).parse(req.body);
      
      // Accept '1234' as a demo code
      if (code === "1234") {
        let user = await storage.getUserByPhone(phoneNumber);
        
        if (!user) {
          user = await storage.createUser({ phoneNumber });
        }
        
        req.session.userId = user.id;
        await req.session.save();
        
        return res.json({ success: true, user });
      }
      
      // Verify actual OTP
      const authCode = await storage.getActiveAuthCode(phoneNumber, code);
      
      if (!authCode) {
        return res.status(401).json({ error: "Invalid or expired code" });
      }
      
      await storage.verifyAuthCode(authCode.id);
      
      // Get or create user
      let user = await storage.getUserByPhone(phoneNumber);
      
      if (!user) {
        user = await storage.createUser({ phoneNumber });
      }
      
      // Create session
      req.session.userId = user.id;
      await req.session.save();
      
      res.json({ success: true, user });
    } catch (error) {
      console.error("Error verifying OTP:", error);
      res.status(400).json({ error: "Invalid request" });
    }
  });
  
  // Get current user
  app.get("/api/auth/me", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    
    const user = await storage.getUser(req.session.userId);
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    res.json(user);
  });
  
  // Logout
  app.post("/api/auth/logout", async (req, res) => {
    req.session.destroy(() => {
      res.json({ success: true });
    });
  });
  
  // ============= LISTINGS ROUTES =============
  
  // Get listings with filters
  app.get("/api/listings", async (req, res) => {
    try {
      const { category, search, sellerId } = req.query;
      
      const listings = await storage.getListings({
        category: category as string,
        search: search as string,
        sellerId: sellerId as string,
      });
      
      res.json(listings);
    } catch (error) {
      console.error("Error fetching listings:", error);
      res.status(500).json({ error: "Failed to fetch listings" });
    }
  });
  
  // Get single listing
  app.get("/api/listings/:id", async (req, res) => {
    try {
      const listing = await storage.getListing(req.params.id);
      
      if (!listing) {
        return res.status(404).json({ error: "Listing not found" });
      }
      
      // Increment view count
      await storage.incrementViews(req.params.id);
      
      res.json(listing);
    } catch (error) {
      console.error("Error fetching listing:", error);
      res.status(500).json({ error: "Failed to fetch listing" });
    }
  });
  
  // Create listing
  app.post("/api/listings", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      const listingData = insertListingSchema.parse({
        ...req.body,
        sellerId: req.session.userId,
      });
      
      const listing = await storage.createListing(listingData);
      
      res.status(201).json(listing);
    } catch (error) {
      console.error("Error creating listing:", error);
      res.status(400).json({ error: "Invalid listing data" });
    }
  });
  
  // Update listing
  app.patch("/api/listings/:id", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      const listing = await storage.getListing(req.params.id);
      
      if (!listing || listing.sellerId !== req.session.userId) {
        return res.status(403).json({ error: "Not authorized" });
      }
      
      const updated = await storage.updateListing(req.params.id, req.body);
      
      res.json(updated);
    } catch (error) {
      console.error("Error updating listing:", error);
      res.status(400).json({ error: "Failed to update listing" });
    }
  });
  
  // Delete listing
  app.delete("/api/listings/:id", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      const listing = await storage.getListing(req.params.id);
      
      if (!listing || listing.sellerId !== req.session.userId) {
        return res.status(403).json({ error: "Not authorized" });
      }
      
      await storage.deleteListing(req.params.id);
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting listing:", error);
      res.status(500).json({ error: "Failed to delete listing" });
    }
  });
  
  // ============= AI ROUTES =============
  
  // Generate description
  app.post("/api/ai/generate-description", async (req, res) => {
    try {
      const { title, category, condition, specs } = req.body;
      
      const description = await aiService.generateDescription({
        title,
        category,
        condition,
        specs,
      });
      
      res.json({ description });
    } catch (error) {
      console.error("Error generating description:", error);
      res.status(500).json({ error: "Failed to generate description" });
    }
  });
  
  // Suggest price
  app.post("/api/ai/suggest-price", async (req, res) => {
    try {
      const { title, category, condition, specs, originalPrice } = req.body;
      
      const pricing = await aiService.suggestPriceRange({
        title,
        category,
        condition,
        specs,
        originalPrice,
      });
      
      res.json(pricing);
    } catch (error) {
      console.error("Error suggesting price:", error);
      res.status(500).json({ error: "Failed to suggest price" });
    }
  });
  
  // Score deal
  app.post("/api/ai/score-deal", async (req, res) => {
    try {
      const { price, marketPrice, category, condition } = req.body;
      
      const score = await aiService.scoreDeal({
        price,
        marketPrice,
        category,
        condition,
      });
      
      res.json(score);
    } catch (error) {
      console.error("Error scoring deal:", error);
      res.status(500).json({ error: "Failed to score deal" });
    }
  });
  
  // Draft reply
  app.post("/api/ai/draft-reply", async (req, res) => {
    try {
      const { message, conversationHistory, listingContext } = req.body;
      
      const draft = await aiService.draftSellerReply({
        message,
        conversationHistory,
        listingContext,
      });
      
      res.json({ draft });
    } catch (error) {
      console.error("Error drafting reply:", error);
      res.status(500).json({ error: "Failed to draft reply" });
    }
  });
  
  // Rewrite description
  app.post("/api/ai/rewrite-description", async (req, res) => {
    try {
      const { description, style } = req.body;
      
      const rewritten = await aiService.rewriteDescription(description, style);
      
      res.json({ description: rewritten });
    } catch (error) {
      console.error("Error rewriting description:", error);
      res.status(500).json({ error: "Failed to rewrite description" });
    }
  });
  
  // ============= MESSAGING ROUTES =============
  
  // Get conversations for user
  app.get("/api/conversations", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      const conversations = await storage.getConversationsByUser(req.session.userId);
      
      res.json(conversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ error: "Failed to fetch conversations" });
    }
  });
  
  // Get messages for conversation
  app.get("/api/conversations/:id/messages", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      const conversation = await storage.getConversation(req.params.id);
      
      if (!conversation) {
        return res.status(404).json({ error: "Conversation not found" });
      }
      
      if (conversation.buyerId !== req.session.userId && conversation.sellerId !== req.session.userId) {
        return res.status(403).json({ error: "Not authorized" });
      }
      
      const messages = await storage.getMessagesByConversation(req.params.id);
      
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });
  
  // Send message
  app.post("/api/conversations/:id/messages", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      const conversation = await storage.getConversation(req.params.id);
      
      if (!conversation) {
        return res.status(404).json({ error: "Conversation not found" });
      }
      
      if (conversation.buyerId !== req.session.userId && conversation.sellerId !== req.session.userId) {
        return res.status(403).json({ error: "Not authorized" });
      }
      
      const { content } = z.object({ content: z.string() }).parse(req.body);
      
      const message = await storage.createMessage({
        conversationId: req.params.id,
        senderId: req.session.userId,
        content,
        isAiGenerated: false,
        status: "sent",
      });
      
      res.status(201).json(message);
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(400).json({ error: "Failed to send message" });
    }
  });
  
  // Start conversation
  app.post("/api/conversations", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      const { listingId, initialMessage } = z.object({
        listingId: z.string(),
        initialMessage: z.string().optional(),
      }).parse(req.body);
      
      const listing = await storage.getListing(listingId);
      
      if (!listing) {
        return res.status(404).json({ error: "Listing not found" });
      }
      
      const conversation = await storage.createConversation({
        listingId,
        buyerId: req.session.userId,
        sellerId: listing.sellerId,
        aiAgentActive: true,
        needsIntervention: false,
      });
      
      if (initialMessage) {
        await storage.createMessage({
          conversationId: conversation.id,
          senderId: req.session.userId,
          content: initialMessage,
          isAiGenerated: false,
          status: "sent",
        });
      }
      
      res.status(201).json(conversation);
    } catch (error) {
      console.error("Error creating conversation:", error);
      res.status(400).json({ error: "Failed to create conversation" });
    }
  });
  
  // ============= DEAL LISTENERS ROUTES (Premium) =============
  
  // Get user's deal listeners
  app.get("/api/deal-listeners", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      const user = await storage.getUser(req.session.userId);
      
      if (!user?.isPremium) {
        return res.status(403).json({ error: "Premium membership required" });
      }
      
      const listeners = await storage.getDealListenersByUser(req.session.userId);
      
      res.json(listeners);
    } catch (error) {
      console.error("Error fetching deal listeners:", error);
      res.status(500).json({ error: "Failed to fetch deal listeners" });
    }
  });
  
  // Create deal listener
  app.post("/api/deal-listeners", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      const user = await storage.getUser(req.session.userId);
      
      if (!user?.isPremium) {
        return res.status(403).json({ error: "Premium membership required" });
      }
      
      const listenerData = insertDealListenerSchema.parse({
        ...req.body,
        userId: req.session.userId,
      });
      
      const listener = await storage.createDealListener(listenerData);
      
      res.status(201).json(listener);
    } catch (error) {
      console.error("Error creating deal listener:", error);
      res.status(400).json({ error: "Invalid deal listener data" });
    }
  });
  
  // Delete deal listener
  app.delete("/api/deal-listeners/:id", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      await storage.deleteDealListener(req.params.id);
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting deal listener:", error);
      res.status(500).json({ error: "Failed to delete deal listener" });
    }
  });
  
  // ============= SAVED LISTINGS ROUTES =============
  
  // Save listing
  app.post("/api/saved-listings", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      const { listingId } = z.object({ listingId: z.string() }).parse(req.body);
      
      const saved = await storage.saveListing(req.session.userId, listingId);
      
      res.status(201).json(saved);
    } catch (error) {
      console.error("Error saving listing:", error);
      res.status(400).json({ error: "Failed to save listing" });
    }
  });
  
  // Unsave listing
  app.delete("/api/saved-listings/:listingId", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      await storage.unsaveListing(req.session.userId, req.params.listingId);
      
      res.status(204).send();
    } catch (error) {
      console.error("Error unsaving listing:", error);
      res.status(500).json({ error: "Failed to unsave listing" });
    }
  });
  
  // Get saved listings
  app.get("/api/saved-listings", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      const listings = await storage.getSavedListings(req.session.userId);
      
      res.json(listings);
    } catch (error) {
      console.error("Error fetching saved listings:", error);
      res.status(500).json({ error: "Failed to fetch saved listings" });
    }
  });

  return httpServer;
}
