import { api } from '@/lib/api';

export const generateDescription = async (title: string, category: string): Promise<string> => {
  try {
    const result = await api.generateDescription({ title, category });
    return result.description;
  } catch (error) {
    console.error('Error generating description:', error);
    // Fallback to simple template
    return `Premium ${title} in excellent condition. Perfect for ${category} enthusiasts. Great deal, won't last long!`;
  }
};

export const suggestPriceRange = async (category: string, condition: string): Promise<{ min: number; max: number; recommended: number }> => {
  try {
    return await api.suggestPrice({ title: '', category, condition });
  } catch (error) {
    console.error('Error suggesting price:', error);
    // Fallback
    return { min: 100, max: 200, recommended: 150 };
  }
};

export const scoreDeal = async (price: number, marketPrice: number): Promise<{ dealScore: number; riskScore: number; reasons: string[] }> => {
  try {
    return await api.scoreDeal({ 
      price, 
      marketPrice, 
      category: 'Electronics', 
      condition: 'Used' 
    });
  } catch (error) {
    console.error('Error scoring deal:', error);
    // Fallback logic
    const score = Math.min(100, Math.max(0, Math.round((1 - price / marketPrice) * 100 + 50)));
    return {
      dealScore: score,
      riskScore: 10,
      reasons: ["Price analysis complete", "Seller verification pending"]
    };
  }
};

export const draftSellerReply = async (message: string, context: string = ""): Promise<string> => {
  try {
    const result = await api.draftReply({ 
      message, 
      listingContext: context 
    });
    return result.draft;
  } catch (error) {
    console.error('Error drafting reply:', error);
    // Fallback
    const lowerMsg = message.toLowerCase();
    if (lowerMsg.includes("available")) {
      return "Yes, it's still available! Would you like to schedule a viewing?";
    } else if (lowerMsg.includes("price")) {
      return "The price is slightly negotiable for serious buyers. What's your best offer?";
    }
    return "Thanks for your interest! I'm happy to answer any questions.";
  }
};

export const rewriteDescription = async (description: string, style: 'professional' | 'casual' | 'shorter'): Promise<string> => {
  try {
    const result = await api.rewriteDescription(description, style);
    return result.description;
  } catch (error) {
    console.error('Error rewriting description:', error);
    return description; // Return original on error
  }
};
