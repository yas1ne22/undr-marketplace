import OpenAI from "openai";

// DeepSeek via OpenRouter using Replit AI Integrations
const openrouter = new OpenAI({
  baseURL: process.env.AI_INTEGRATIONS_OPENROUTER_BASE_URL,
  apiKey: process.env.AI_INTEGRATIONS_OPENROUTER_API_KEY,
});

const DEEPSEEK_MODEL = "deepseek/deepseek-chat";

export interface DescriptionGenerationParams {
  title: string;
  category: string;
  condition?: string;
  specs?: any;
}

export interface PriceSuggestionParams {
  title: string;
  category: string;
  condition: string;
  specs?: any;
  originalPrice?: number;
}

export interface DealScoreParams {
  price: number;
  marketPrice: number;
  category: string;
  condition: string;
  sellerReputation?: number;
}

export interface ChatDraftParams {
  message: string;
  conversationHistory?: Array<{ role: string; content: string }>;
  listingContext?: string;
}

export class AIService {
  async generateDescription(params: DescriptionGenerationParams): Promise<string> {
    try {
      const prompt = `You are a marketplace listing expert. Generate a compelling, honest product description.

Product: ${params.title}
Category: ${params.category}
${params.condition ? `Condition: ${params.condition}` : ''}
${params.specs ? `Specs: ${JSON.stringify(params.specs)}` : ''}

Generate a 2-3 sentence description that:
- Highlights key features and condition
- Is honest and realistic (not overly promotional)
- Appeals to buyers looking for deals
- Mentions what's included if applicable

Description:`;

      const response = await openrouter.chat.completions.create({
        model: DEEPSEEK_MODEL,
        messages: [{ role: "user", content: prompt }],
        max_tokens: 200,
        temperature: 0.7,
      });

      return response.choices[0]?.message?.content?.trim() || "";
    } catch (error) {
      console.error("Error generating description:", error);
      throw new Error("Failed to generate description");
    }
  }

  async suggestPriceRange(params: PriceSuggestionParams): Promise<{
    min: number;
    max: number;
    recommended: number;
  }> {
    try {
      const prompt = `You are a pricing expert for a marketplace in Qatar (currency: QAR).

Product: ${params.title}
Category: ${params.category}
Condition: ${params.condition}
${params.originalPrice ? `Original Price: ${params.originalPrice} QAR` : ''}
${params.specs ? `Specs: ${JSON.stringify(params.specs)}` : ''}

Analyze the market and provide pricing recommendations in QAR. Consider:
- Qatar market prices
- Product condition
- Category demand
- Competitive pricing for quick sale

Respond with ONLY a JSON object (no markdown, no extra text):
{"min": <number>, "max": <number>, "recommended": <number>}`;

      const response = await openrouter.chat.completions.create({
        model: DEEPSEEK_MODEL,
        messages: [{ role: "user", content: prompt }],
        max_tokens: 100,
        temperature: 0.3,
      });

      const content = response.choices[0]?.message?.content?.trim() || "";
      
      // Extract JSON from response
      const jsonMatch = content.match(/\{[^}]+\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          min: Math.round(parsed.min),
          max: Math.round(parsed.max),
          recommended: Math.round(parsed.recommended),
        };
      }
      
      throw new Error("Invalid response format");
    } catch (error) {
      console.error("Error suggesting price:", error);
      // Fallback to basic logic
      const basePrice = params.originalPrice || 1000;
      const multiplier = params.condition === "New" ? 0.9 : params.condition === "Like New" ? 0.7 : 0.5;
      const estimated = Math.round(basePrice * multiplier);
      
      return {
        min: Math.round(estimated * 0.85),
        max: Math.round(estimated * 1.15),
        recommended: estimated,
      };
    }
  }

  async scoreDeal(params: DealScoreParams): Promise<{
    dealScore: number;
    riskScore: number;
    reasons: string[];
  }> {
    try {
      const prompt = `You are a deal analysis expert for a marketplace.

Listing Price: ${params.price} QAR
Market Price: ${params.marketPrice} QAR
Category: ${params.category}
Condition: ${params.condition}
${params.sellerReputation !== undefined ? `Seller Reputation (0-100): ${params.sellerReputation}` : ''}

Analyze this deal and provide:
1. Deal Score (0-100): How good is this deal for buyers?
2. Risk Score (0-100): How risky is this purchase?
3. 2-3 specific reasons for your scores

Respond with ONLY a JSON object (no markdown):
{"dealScore": <number>, "riskScore": <number>, "reasons": ["reason1", "reason2"]}`;

      const response = await openrouter.chat.completions.create({
        model: DEEPSEEK_MODEL,
        messages: [{ role: "user", content: prompt }],
        max_tokens: 200,
        temperature: 0.5,
      });

      const content = response.choices[0]?.message?.content?.trim() || "";
      
      // Extract JSON
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          dealScore: Math.min(100, Math.max(0, Math.round(parsed.dealScore))),
          riskScore: Math.min(100, Math.max(0, Math.round(parsed.riskScore))),
          reasons: Array.isArray(parsed.reasons) ? parsed.reasons.slice(0, 3) : [],
        };
      }
      
      throw new Error("Invalid response format");
    } catch (error) {
      console.error("Error scoring deal:", error);
      // Fallback logic
      const ratio = params.price / params.marketPrice;
      let dealScore = 50;
      
      if (ratio < 0.7) dealScore = 95;
      else if (ratio < 0.85) dealScore = 85;
      else if (ratio < 1.0) dealScore = 70;
      else dealScore = 40;
      
      return {
        dealScore,
        riskScore: 15,
        reasons: [
          ratio < 0.9 ? "Price below market average" : "Fair market price",
          "Seller verification needed",
        ],
      };
    }
  }

  async draftSellerReply(params: ChatDraftParams): Promise<string> {
    try {
      const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
        {
          role: "system",
          content: `You are an AI assistant helping a seller respond to buyer inquiries on a marketplace platform in Qatar. 
Be professional, friendly, and helpful. Keep responses concise (1-2 sentences).
${params.listingContext ? `\n\nListing Context: ${params.listingContext}` : ''}`,
        },
      ];

      if (params.conversationHistory && params.conversationHistory.length > 0) {
        messages.push(...params.conversationHistory.map(msg => ({
          role: msg.role as "user" | "assistant",
          content: msg.content,
        })));
      }

      messages.push({
        role: "user",
        content: `Draft a helpful seller response to this buyer message: "${params.message}"`,
      });

      const response = await openrouter.chat.completions.create({
        model: DEEPSEEK_MODEL,
        messages,
        max_tokens: 150,
        temperature: 0.7,
      });

      return response.choices[0]?.message?.content?.trim() || "";
    } catch (error) {
      console.error("Error drafting reply:", error);
      // Simple fallback
      const lowerMsg = params.message.toLowerCase();
      if (lowerMsg.includes("available")) {
        return "Yes, it's still available! Would you like to schedule a viewing?";
      } else if (lowerMsg.includes("price")) {
        return "The price is slightly negotiable for serious buyers. What's your best offer?";
      }
      return "Thanks for your interest! I'm happy to answer any questions you have.";
    }
  }

  async rewriteDescription(description: string, style: "professional" | "casual" | "shorter"): Promise<string> {
    try {
      let instruction = "";
      switch (style) {
        case "professional":
          instruction = "Rewrite this in a more professional, business-like tone";
          break;
        case "casual":
          instruction = "Rewrite this in a more casual, friendly tone";
          break;
        case "shorter":
          instruction = "Make this more concise while keeping key information";
          break;
      }

      const response = await openrouter.chat.completions.create({
        model: DEEPSEEK_MODEL,
        messages: [
          {
            role: "user",
            content: `${instruction}:\n\n${description}\n\nRewritten version:`,
          },
        ],
        max_tokens: 200,
        temperature: 0.7,
      });

      return response.choices[0]?.message?.content?.trim() || description;
    } catch (error) {
      console.error("Error rewriting description:", error);
      return description;
    }
  }
}

export const aiService = new AIService();
