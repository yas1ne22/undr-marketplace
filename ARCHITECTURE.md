# Undr - Complete Architecture & Design Documentation

This document provides a comprehensive end-to-end explanation of the Undr application architecture, design patterns, and implementation details. It is intended for AI agents or developers who want to understand or replicate this design.

---

## 1. Application Overview

**Undr** is a premium deals marketplace platform built for Qatar's market. It features:
- Phone/OTP authentication (no passwords)
- AI-powered listing creation with DeepSeek
- Real-time messaging between buyers and sellers
- Premium features including personalized deal alerts
- Deal scoring and risk analysis

### Core Value Propositions
1. **AI-Assisted Selling**: Automatically generates descriptions, suggests prices, and scores deals
2. **Frictionless Authentication**: Phone-based OTP login with no password requirements
3. **Premium Features**: Deal listeners that alert users when matching deals appear

---

## 2. Technology Stack

### Backend
| Component | Technology | Purpose |
|-----------|------------|---------|
| Runtime | Node.js 20+ | JavaScript runtime |
| Framework | Express.js | HTTP server and routing |
| Language | TypeScript | Type safety |
| Database | PostgreSQL | Primary data store |
| ORM | Drizzle ORM | Type-safe database queries |
| Session | express-session | Session management |
| AI | OpenRouter (DeepSeek) | AI content generation |

### Frontend
| Component | Technology | Purpose |
|-----------|------------|---------|
| Framework | React 18+ | UI library |
| Language | TypeScript | Type safety |
| Routing | Wouter | Lightweight routing |
| State | Zustand | Global state management |
| UI Components | shadcn/ui | Pre-built accessible components |
| Styling | Tailwind CSS | Utility-first CSS |
| Icons | Lucide React | Consistent icon system |
| Build | Vite | Fast development and bundling |

---

## 3. Project Structure

```
├── client/                    # Frontend React application
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   │   └── ui/           # shadcn/ui components
│   │   ├── hooks/            # Custom React hooks
│   │   ├── lib/              # Utilities (api.ts, utils.ts)
│   │   ├── pages/            # Route pages
│   │   ├── services/         # API service wrappers
│   │   ├── stores/           # Zustand state stores
│   │   ├── App.tsx           # Main app with routing
│   │   └── main.tsx          # Entry point
│   └── index.html            # HTML template
├── server/                    # Backend Express application
│   ├── ai-service.ts         # DeepSeek AI integration
│   ├── db.ts                 # Database connection
│   ├── index.ts              # Server entry point
│   ├── routes.ts             # API route definitions
│   ├── storage.ts            # Database operations interface
│   └── replit_integrations/  # AI integration helpers
├── shared/                    # Shared between frontend/backend
│   └── schema.ts             # Database schema & types
└── drizzle.config.ts         # Drizzle ORM configuration
```

---

## 4. Database Schema Design

### Design Principles
1. **UUID Primary Keys**: All tables use UUID for distributed-friendly IDs
2. **Timestamps**: Only where business logic requires (createdAt on most tables)
3. **No Passwords**: Auth is phone/OTP based only
4. **Denormalization**: Some data duplicated for query performance

### Tables

#### `users`
```typescript
{
  id: uuid,              // Primary key
  phoneNumber: text,     // Unique, required for auth
  name: text,            // Optional display name
  avatarUrl: text,       // Optional profile image
  isPremium: boolean,    // Premium membership status
  premiumExpiresAt: timestamp,
  createdAt: timestamp
}
```

#### `listings`
```typescript
{
  id: uuid,
  sellerId: uuid,        // FK to users
  title: text,
  description: text,
  price: integer,        // In QAR (Qatari Riyal)
  originalPrice: integer,
  category: text,        // Electronics, Fashion, etc.
  condition: text,       // New, Like New, Good, Fair
  images: text[],        // Array of image URLs
  specs: jsonb,          // Flexible specifications
  location: text,
  dealScore: integer,    // AI-calculated 0-100
  riskLevel: text,       // low, medium, high
  riskReasons: text[],   // Array of risk explanations
  status: text,          // active, sold, expired
  viewCount: integer,
  createdAt: timestamp
}
```

#### `conversations`
```typescript
{
  id: uuid,
  listingId: uuid,       // FK to listings
  buyerId: uuid,         // FK to users
  sellerId: uuid,        // FK to users
  lastMessageAt: timestamp,
  aiAgentEnabled: boolean,
  aiInterventionCount: integer,
  createdAt: timestamp
}
```

#### `messages`
```typescript
{
  id: uuid,
  conversationId: uuid,  // FK to conversations
  senderId: uuid,        // FK to users
  content: text,
  isAiGenerated: boolean,
  status: text,          // sent, delivered, read
  createdAt: timestamp
}
```

#### `auth_codes`
```typescript
{
  id: uuid,
  phoneNumber: text,
  code: text,            // 4-digit OTP
  expiresAt: timestamp,
  used: boolean,
  createdAt: timestamp
}
```

#### `deal_listeners` (Premium Feature)
```typescript
{
  id: uuid,
  userId: uuid,          // FK to users
  category: text,
  keywords: text[],
  maxPrice: integer,
  minDealScore: integer,
  notifyWhatsapp: boolean,
  notifyEmail: boolean,
  createdAt: timestamp
}
```

#### `saved_listings`
```typescript
{
  id: uuid,
  userId: uuid,          // FK to users
  listingId: uuid,       // FK to listings
  createdAt: timestamp
}
```

---

## 5. Authentication System

### Flow
```
1. User enters phone number
2. POST /api/auth/request-otp
   - Generate 4-digit code
   - Store in auth_codes with 10-minute expiry
   - (Production: Send via SMS)
3. User enters OTP code
4. POST /api/auth/verify-otp
   - Validate code against auth_codes
   - Create user if not exists
   - Create session with userId
5. Session cookie sent to client
6. All authenticated requests check req.session.userId
```

### Demo Mode
- Code `1234` always works for testing
- In development, actual code is returned in API response

### Session Configuration
```typescript
session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
  }
})
```

---

## 6. AI Integration (DeepSeek via OpenRouter)

### Configuration
Uses Replit AI Integrations which auto-provides:
- `AI_INTEGRATIONS_OPENROUTER_BASE_URL`
- `AI_INTEGRATIONS_OPENROUTER_API_KEY`

### AI Service Functions

#### `generateDescription(title, category, condition)`
Generates marketplace-optimized product descriptions.

**Prompt Strategy**:
- Context: Qatar marketplace, QAR currency
- Tone: Professional but conversational
- Length: 2-3 paragraphs
- Includes: Key features, condition notes, call-to-action

#### `suggestPrice(title, category, condition, description)`
Returns price range based on market analysis.

**Response Format**:
```typescript
{
  minPrice: number,
  maxPrice: number,
  suggestedPrice: number,
  reasoning: string
}
```

#### `scoreDeal(listing)`
Calculates deal quality score and risk assessment.

**Response Format**:
```typescript
{
  score: number,        // 0-100
  riskLevel: string,    // low, medium, high
  reasons: string[]     // Explanation bullets
}
```

#### `draftReply(conversation, listing, recentMessages)`
Generates contextual seller replies.

**Context Provided**:
- Full listing details
- Recent message history
- Buyer's last message

#### `rewriteDescription(description, style)`
Rewrites in different tones: professional, casual, concise.

### Error Handling
All AI functions have fallback responses if API fails.

---

## 7. API Design

### Route Patterns
- All routes prefixed with `/api`
- RESTful design with standard HTTP methods
- JSON request/response bodies
- Zod validation on inputs

### Authentication Routes
```
POST /api/auth/request-otp    { phoneNumber }
POST /api/auth/verify-otp     { phoneNumber, code }
GET  /api/auth/me             (authenticated)
POST /api/auth/logout         (authenticated)
```

### Resource Routes
```
GET    /api/listings          ?category=&search=
GET    /api/listings/:id
POST   /api/listings          (authenticated)
PATCH  /api/listings/:id      (authenticated, owner only)
DELETE /api/listings/:id      (authenticated, owner only)

GET    /api/conversations     (authenticated)
GET    /api/conversations/:id/messages
POST   /api/conversations/:id/messages
POST   /api/conversations     (start new)

GET    /api/saved-listings    (authenticated)
POST   /api/saved-listings    (authenticated)
DELETE /api/saved-listings/:listingId

GET    /api/deal-listeners    (authenticated, premium)
POST   /api/deal-listeners    (authenticated, premium)
DELETE /api/deal-listeners/:id
```

### AI Routes
```
POST /api/ai/generate-description
POST /api/ai/suggest-price
POST /api/ai/score-deal
POST /api/ai/draft-reply
POST /api/ai/rewrite-description
```

---

## 8. Frontend Architecture

### State Management (Zustand)

#### Auth Store
```typescript
interface AuthState {
  user: User | null;
  isLoading: boolean;
  login: (user: User) => void;
  logout: () => void;
  checkAuth: () => Promise<void>;
}
```

### API Client Pattern
Centralized API client in `lib/api.ts`:
```typescript
const api = {
  auth: {
    requestOtp: (phoneNumber) => fetch('/api/auth/request-otp', ...),
    verifyOtp: (phoneNumber, code) => fetch('/api/auth/verify-otp', ...),
    me: () => fetch('/api/auth/me'),
    logout: () => fetch('/api/auth/logout', ...)
  },
  listings: { ... },
  ai: { ... }
}
```

### Routing (Wouter)
```typescript
<Switch>
  <Route path="/" component={Home} />
  <Route path="/auth" component={Auth} />
  <Route path="/sell" component={Sell} />
  <Route path="/listing/:id" component={ListingDetail} />
  <Route path="/messages" component={Messages} />
  <Route path="/profile" component={Profile} />
</Switch>
```

### Component Patterns

#### Page Layout
```typescript
function Page() {
  return (
    <Layout>
      <Header />
      <main className="container mx-auto px-4 py-6">
        {/* Page content */}
      </main>
      <BottomNav />
    </Layout>
  );
}
```

#### Data Fetching
Uses React Query pattern with custom hooks:
```typescript
function useListings(filters) {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    api.listings.getAll(filters)
      .then(setListings)
      .finally(() => setLoading(false));
  }, [filters]);
  
  return { listings, loading };
}
```

---

## 9. UI/UX Design Patterns

### Design System
- **Colors**: Dark theme with amber/gold accents
- **Typography**: System font stack
- **Spacing**: Tailwind's spacing scale
- **Icons**: Lucide React (no emojis)
- **Animations**: Framer Motion for transitions

### Component Library (shadcn/ui)
Pre-configured components:
- Button, Input, Label
- Dialog, Sheet, Popover
- Card, Badge, Avatar
- Tabs, Accordion
- Toast notifications (Sonner)

### AI Indicator Pattern
All AI-generated content shows a chip:
```tsx
<Badge variant="secondary" className="text-xs">
  <Sparkles className="h-3 w-3 mr-1" />
  AI Suggested
</Badge>
```

### Form Patterns
Using react-hook-form with zod validation:
```typescript
const form = useForm({
  resolver: zodResolver(schema),
  defaultValues: { ... }
});
```

---

## 10. Data Flow Examples

### Creating a Listing with AI

```
1. User fills title, selects category & condition
2. Click "Generate Description"
   → POST /api/ai/generate-description
   → DeepSeek generates description
   → UI shows with "AI Suggested" chip
   
3. User can edit or click rewrite chips:
   → POST /api/ai/rewrite-description { style: "professional" }
   
4. Click "Suggest Price"
   → POST /api/ai/suggest-price
   → Returns min/max/suggested prices
   
5. User adjusts price (real-time score updates):
   → POST /api/ai/score-deal (debounced)
   → Updates deal score display
   
6. Submit listing
   → POST /api/listings
   → Redirects to listing page
```

### Messaging Flow

```
1. Buyer views listing, clicks "Message Seller"
   → POST /api/conversations { listingId }
   → Creates or returns existing conversation
   
2. Buyer sends message
   → POST /api/conversations/:id/messages
   
3. Seller can use AI to draft reply
   → POST /api/ai/draft-reply
   → Shows suggested response
   → Seller can edit and send
```

---

## 11. Premium Features

### Deal Listeners
Premium users can create alerts:
```typescript
{
  category: "Electronics",
  keywords: ["iPhone", "Samsung"],
  maxPrice: 2000,
  minDealScore: 80,
  notifyWhatsapp: true
}
```

When new listings match, system would:
1. Check all active listeners
2. Score new listing against criteria
3. Send notification (WhatsApp/Email integration needed)

---

## 12. Environment Variables

### Required
```
DATABASE_URL=postgresql://...
SESSION_SECRET=random-secret-key
```

### Auto-Configured (Replit AI Integrations)
```
AI_INTEGRATIONS_OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
AI_INTEGRATIONS_OPENROUTER_API_KEY=sk-...
```

---

## 13. Database Commands

```bash
# Push schema changes to database
npm run db:push

# Generate migrations (if needed)
npx drizzle-kit generate

# Open Drizzle Studio
npx drizzle-kit studio
```

---

## 14. Key Implementation Notes

### Phone Number Handling
- Stored with country code
- Normalized on input
- Used as unique identifier

### Price Handling
- Stored as integers (no decimals)
- Currency is always QAR
- Display with currency symbol

### Image Handling
- Stored as URL array
- First image is primary
- Currently URL-based (cloud storage integration needed for uploads)

### Deal Score Algorithm
AI considers:
- Price vs. market value
- Seller history
- Item condition
- Description quality
- Image quality

---

## 15. Security Considerations

1. **Session Security**: httpOnly cookies, secure in production
2. **Input Validation**: Zod schemas on all inputs
3. **SQL Injection**: Prevented by Drizzle ORM parameterized queries
4. **Authentication**: All sensitive routes check session
5. **Authorization**: Owner checks on update/delete operations

---

## 16. Scaling Considerations

For production scaling:
1. **Sessions**: Move to Redis/PostgreSQL store
2. **Images**: Add cloud storage (S3/Cloudinary)
3. **SMS**: Integrate Twilio for real OTP
4. **WebSockets**: Add for real-time messaging
5. **Caching**: Add Redis for frequently accessed data
6. **Queue**: Add job queue for notifications

---

## 17. Testing Approach

### Manual Testing Checklist
- [ ] OTP request/verify flow
- [ ] Create listing with AI generation
- [ ] Search and filter listings
- [ ] Start conversation
- [ ] Send/receive messages
- [ ] Save/unsave listings
- [ ] Premium feature access control

### Demo Credentials
- Any phone number works
- OTP code: `1234`
- Premium features: Set `isPremium: true` in database

---

This documentation provides a complete blueprint for understanding and replicating the Undr application architecture.
