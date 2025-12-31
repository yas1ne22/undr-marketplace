// API Client for backend communication

class APIClient {
  private baseURL = '/api';

  private async fetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      credentials: 'include', // Important for session cookies
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Auth
  async requestOTP(phoneNumber: string) {
    return this.fetch<{ success: boolean; devCode?: string }>('/auth/request-otp', {
      method: 'POST',
      body: JSON.stringify({ phoneNumber }),
    });
  }

  async verifyOTP(phoneNumber: string, code: string) {
    return this.fetch<{ success: boolean; user: any }>('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ phoneNumber, code }),
    });
  }

  async getCurrentUser() {
    return this.fetch<any>('/auth/me');
  }

  async logout() {
    return this.fetch<{ success: boolean }>('/auth/logout', {
      method: 'POST',
    });
  }

  // Listings
  async getListings(filters?: { category?: string; search?: string }) {
    const params = new URLSearchParams();
    if (filters?.category) params.set('category', filters.category);
    if (filters?.search) params.set('search', filters.search);
    
    const query = params.toString();
    return this.fetch<any[]>(`/listings${query ? `?${query}` : ''}`);
  }

  async getListing(id: string) {
    return this.fetch<any>(`/listings/${id}`);
  }

  async createListing(listing: any) {
    return this.fetch<any>('/listings', {
      method: 'POST',
      body: JSON.stringify(listing),
    });
  }

  async updateListing(id: string, updates: any) {
    return this.fetch<any>(`/listings/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async deleteListing(id: string) {
    return this.fetch<void>(`/listings/${id}`, {
      method: 'DELETE',
    });
  }

  // AI Services
  async generateDescription(params: { title: string; category: string; condition?: string; specs?: any }) {
    return this.fetch<{ description: string }>('/ai/generate-description', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  async suggestPrice(params: { title: string; category: string; condition: string; specs?: any; originalPrice?: number }) {
    return this.fetch<{ min: number; max: number; recommended: number }>('/ai/suggest-price', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  async scoreDeal(params: { price: number; marketPrice: number; category: string; condition: string }) {
    return this.fetch<{ dealScore: number; riskScore: number; reasons: string[] }>('/ai/score-deal', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  async draftReply(params: { message: string; conversationHistory?: any[]; listingContext?: string }) {
    return this.fetch<{ draft: string }>('/ai/draft-reply', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  async rewriteDescription(description: string, style: 'professional' | 'casual' | 'shorter') {
    return this.fetch<{ description: string }>('/ai/rewrite-description', {
      method: 'POST',
      body: JSON.stringify({ description, style }),
    });
  }

  // Messaging
  async getConversations() {
    return this.fetch<any[]>('/conversations');
  }

  async getConversationMessages(conversationId: string) {
    return this.fetch<any[]>(`/conversations/${conversationId}/messages`);
  }

  async sendMessage(conversationId: string, content: string) {
    return this.fetch<any>(`/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  }

  async startConversation(listingId: string, initialMessage?: string) {
    return this.fetch<any>('/conversations', {
      method: 'POST',
      body: JSON.stringify({ listingId, initialMessage }),
    });
  }

  // Deal Listeners (Premium)
  async getDealListeners() {
    return this.fetch<any[]>('/deal-listeners');
  }

  async createDealListener(listener: any) {
    return this.fetch<any>('/deal-listeners', {
      method: 'POST',
      body: JSON.stringify(listener),
    });
  }

  async deleteDealListener(id: string) {
    return this.fetch<void>(`/deal-listeners/${id}`, {
      method: 'DELETE',
    });
  }

  // Saved Listings
  async getSavedListings() {
    return this.fetch<any[]>('/saved-listings');
  }

  async saveListing(listingId: string) {
    return this.fetch<any>('/saved-listings', {
      method: 'POST',
      body: JSON.stringify({ listingId }),
    });
  }

  async unsaveListing(listingId: string) {
    return this.fetch<void>(`/saved-listings/${listingId}`, {
      method: 'DELETE',
    });
  }
}

export const api = new APIClient();
