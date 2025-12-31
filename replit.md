# Undr - Premium Deals Marketplace

## Overview
Undr is a premium deals marketplace platform with AI-powered features using DeepSeek API. The application features phone/OTP authentication, AI-assisted sell wizard with photo analysis and deal optimization, real-time messaging with AI agent support, and premium features including personalized deal alerts.

## Recent Changes
- **Dec 31, 2025**: Converted from rapid prototype to full-stack application with complete backend integration
  - Database schema created with PostgreSQL
  - Phone/OTP authentication system implemented
  - DeepSeek AI integration via OpenRouter (Replit AI Integrations)
  - Full API layer for listings, messaging, and premium features
  - Frontend connected to backend APIs

## Project Architecture

### Backend Stack
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **AI Service**: DeepSeek via OpenRouter (using Replit AI Integrations)
- **Session Management**: express-session
- **Authentication**: Phone/OTP (no passwords)

### Frontend Stack
- **Framework**: React with TypeScript
- **Routing**: Wouter
- **State Management**: Zustand
- **UI Components**: shadcn/ui with Tailwind CSS
- **Styling**: Tailwind CSS with custom design system

### Database Schema

#### Users
- Phone-based authentication (no passwords)
- Premium membership tracking
- Avatar and profile data

#### Listings
- Full product information with images
- AI-generated descriptions and pricing
- Deal scores and risk analysis
- Category, condition, and specs tracking

#### Conversations & Messages
- Real-time messaging between buyers and sellers
- AI agent support with intervention tracking
- Status tracking (sent, delivered, read)

#### Deal Listeners (Premium)
- Personalized alerts based on category, keywords, price
- WhatsApp/Email notifications
- AI-powered deal scoring

## AI Features (DeepSeek)

### Description Generation
- Context-aware product descriptions
- Category-specific templates
- Condition-based optimization

### Price Suggestions
- Market analysis for Qatar (QAR currency)
- Condition-based pricing
- Competitive price recommendations

### Deal Scoring
- Real-time deal analysis (0-100 score)
- Risk assessment
- Reason-based explanations

### Chat Assistance
- AI-powered reply drafting for sellers
- Conversation context awareness
- Listing information integration

### Description Rewriting
- Professional tone
- Casual/friendly tone
- Concise/shorter versions

## API Endpoints

### Authentication
- `POST /api/auth/request-otp` - Request OTP for phone number
- `POST /api/auth/verify-otp` - Verify OTP and create session
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout and destroy session

### Listings
- `GET /api/listings` - Get all listings with filters (category, search)
- `GET /api/listings/:id` - Get single listing
- `POST /api/listings` - Create new listing
- `PATCH /api/listings/:id` - Update listing
- `DELETE /api/listings/:id` - Delete listing

### AI Services
- `POST /api/ai/generate-description` - Generate product description
- `POST /api/ai/suggest-price` - Suggest price range
- `POST /api/ai/score-deal` - Calculate deal score
- `POST /api/ai/draft-reply` - Draft seller reply
- `POST /api/ai/rewrite-description` - Rewrite description in different style

### Messaging
- `GET /api/conversations` - Get user's conversations
- `GET /api/conversations/:id/messages` - Get messages for conversation
- `POST /api/conversations/:id/messages` - Send message
- `POST /api/conversations` - Start new conversation

### Premium Features
- `GET /api/deal-listeners` - Get user's deal listeners
- `POST /api/deal-listeners` - Create deal listener
- `DELETE /api/deal-listeners/:id` - Delete deal listener

### Saved Listings
- `GET /api/saved-listings` - Get saved listings
- `POST /api/saved-listings` - Save a listing
- `DELETE /api/saved-listings/:listingId` - Unsave a listing

## User Preferences

### Design Choices
- **Icons**: Lucide icons consistently throughout (no emojis)
- **AI Indicators**: "AI Suggested" chips for all AI-generated content
- **Deal Optimization**: Real-time score updates with debouncing
- **No Mock Data**: All features use real backend APIs

### Authentication Flow
1. User enters phone number
2. System sends 4-digit OTP (demo code: '1234')
3. User verifies OTP
4. Session created, user redirected to home

## Environment Variables

Required for production:
- `DATABASE_URL` - PostgreSQL connection string
- `SESSION_SECRET` - Session encryption key
- `AI_INTEGRATIONS_OPENROUTER_BASE_URL` - OpenRouter API base URL (auto-configured)
- `AI_INTEGRATIONS_OPENROUTER_API_KEY` - OpenRouter API key (auto-configured)

## Development Notes

### Testing Authentication
- Use any phone number in the auth form
- Enter '1234' as the OTP code (demo mode)
- In development, the actual OTP is logged to console and returned in the API response

### AI Integration
- Uses DeepSeek model via OpenRouter
- Powered by Replit AI Integrations (no personal API key needed)
- Fallback logic in place for all AI features if API fails
- Model: `deepseek/deepseek-chat`

### Database Migrations
- Use `npm run db:push` to sync schema changes
- Drizzle ORM handles all database operations
- No manual migrations needed

## Next Steps

Potential future enhancements:
- Real SMS integration for OTP (Twilio, etc.)
- Image upload to cloud storage (Cloudinary, S3)
- WebSocket support for real-time messaging
- Push notifications for deal alerts
- Advanced AI agent capabilities (price negotiation, scheduling)
- Analytics dashboard for sellers
- Payment integration (Stripe, PayPal)
