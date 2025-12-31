import { create } from 'zustand';

export interface Listing {
  id: string;
  title: string;
  price: number;
  originalPrice: number;
  currency: string;
  category: string;
  condition: 'New' | 'Like New' | 'Good' | 'Fair';
  description: string;
  images: string[];
  location: string;
  postedAt: string;
  dealScore: number; // 0-100
  riskScore: number; // 0-100
  sellerId: string;
  sellerName: string;
  isPremiumEarlyAccess: boolean;
}

export const CATEGORIES = [
  "Electronics",
  "Furniture",
  "Appliances",
  "Fashion",
  "Baby & Kids",
  "Vehicles"
];

export const NEIGHBORHOODS = [
  "West Bay",
  "The Pearl",
  "Lusail",
  "Al Sadd",
  "Al Waab",
  "Madinat Khalifa",
  "Old Airport"
];

const MOCK_LISTINGS: Listing[] = [
  {
    id: "1",
    title: "Toyota Land Cruiser VX-R 2022 - Full Option",
    price: 310000,
    originalPrice: 345000,
    currency: "QAR",
    category: "Vehicles",
    condition: "Like New",
    description: "Low mileage (25k km). Always serviced at agency. Full protection film installed. No accidents, original paint. Expat owner leaving Qatar.",
    images: [
      "https://images.unsplash.com/photo-1721669460064-500b6755a5b5?q=80&w=800&auto=format&fit=crop"
    ],
    location: "West Bay",
    postedAt: "2024-12-31T09:00:00Z",
    dealScore: 92,
    riskScore: 2,
    sellerId: "user1",
    sellerName: "Mohammed A.",
    isPremiumEarlyAccess: true,
  },
  {
    id: "2",
    title: "IKEA Soderhamn 3-Seat Sofa Section",
    price: 950,
    originalPrice: 1850,
    currency: "QAR",
    category: "Furniture",
    condition: "Good",
    description: "Samsta dark grey color. Very comfortable deep seating. Covers are removable and washable. Moving out sale, must go by Friday.",
    images: [
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=800&auto=format&fit=crop"
    ],
    location: "The Pearl",
    postedAt: "2024-12-30T14:30:00Z",
    dealScore: 88,
    riskScore: 12,
    sellerId: "user2",
    sellerName: "Sarah J.",
    isPremiumEarlyAccess: false,
  },
  {
    id: "3",
    title: "iPhone 15 Pro - 128GB Natural Titanium",
    price: 3100,
    originalPrice: 3999,
    currency: "QAR",
    category: "Electronics",
    condition: "Like New",
    description: "Immaculate condition, always used with case and screen protector. Battery health 98%. Includes original box and unused charging cable.",
    images: [
      "https://images.unsplash.com/photo-1696446701796-da61225697cc?q=80&w=800&auto=format&fit=crop"
    ],
    location: "Lusail",
    postedAt: "2024-12-31T10:15:00Z",
    dealScore: 75,
    riskScore: 5,
    sellerId: "user3",
    sellerName: "Khalid Tech",
    isPremiumEarlyAccess: false,
  },
  {
    id: "4",
    title: "PlayStation 5 Disc Edition + 2 Controllers",
    price: 1350,
    originalPrice: 2199,
    currency: "QAR",
    category: "Electronics",
    condition: "Good",
    description: "PS5 console in perfect working order. Comes with 2 DualSense controllers (one white, one black) and FIFA 24. Selling because I don't have time to play.",
    images: [
      "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?q=80&w=800&auto=format&fit=crop"
    ],
    location: "Al Sadd",
    postedAt: "2024-12-29T18:00:00Z",
    dealScore: 85,
    riskScore: 8,
    sellerId: "user4",
    sellerName: "Gamer Zone",
    isPremiumEarlyAccess: true,
  },
  {
    id: "5",
    title: "Herman Miller Aeron Chair - Size B",
    price: 2500,
    originalPrice: 5800,
    currency: "QAR",
    category: "Furniture",
    condition: "Like New",
    description: "Authentic Herman Miller Aeron. Fully loaded with posture fit SL, tilt limiter, and adjustable arms. Mesh is perfect. Best office chair you can buy.",
    images: ["https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?q=80&w=800&auto=format&fit=crop"],
    location: "West Bay",
    postedAt: "2024-12-31T11:00:00Z",
    dealScore: 85,
    riskScore: 3,
    sellerId: "user5",
    sellerName: "Office Liquidation",
    isPremiumEarlyAccess: true,
  },
  {
    id: "6",
    title: "Louis Vuitton Neverfull MM Damier Ebene",
    price: 4500,
    originalPrice: 7800,
    currency: "QAR",
    category: "Fashion",
    condition: "Good",
    description: "100% Authentic with receipt from Villagio Mall. Interior has some pen marks (see photos), exterior is perfect canvas. Comes with dust bag, no pouch.",
    images: ["https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=800&auto=format&fit=crop"],
    location: "The Pearl",
    postedAt: "2024-12-28T12:00:00Z",
    dealScore: 72,
    riskScore: 25, 
    sellerId: "user6",
    sellerName: "Luxury Closet",
    isPremiumEarlyAccess: false,
  },
  {
    id: "7",
    title: "Apple MacBook Air M2 - Midnight Blue",
    price: 3200,
    originalPrice: 4699,
    currency: "QAR",
    category: "Electronics",
    condition: "Like New",
    description: "MacBook Air M2 chip, 8GB RAM, 256GB SSD. Not a single scratch, barely used as a secondary laptop. Cycle count is only 24. Arabic/English keyboard.",
    images: ["https://images.unsplash.com/photo-1699517178550-6c99c351b88e?q=80&w=800&auto=format&fit=crop"],
    location: "Education City",
    postedAt: "2024-12-31T08:30:00Z",
    dealScore: 90,
    riskScore: 4,
    sellerId: "user7",
    sellerName: "University Student",
    isPremiumEarlyAccess: true,
  },
  {
    id: "8",
    title: "Dyson V15 Detect Absolute Vacuum",
    price: 2100,
    originalPrice: 3200,
    currency: "QAR",
    category: "Appliances",
    condition: "Like New",
    description: "Bought 3 months ago from FNAC. Still under warranty. Laser detect head is amazing for dust. Box and all accessories included.",
    images: ["https://images.unsplash.com/photo-1558317374-a309d244678d?q=80&w=800&auto=format&fit=crop"], 
    location: "Al Waab",
    postedAt: "2024-12-30T09:00:00Z",
    dealScore: 78,
    riskScore: 5,
    sellerId: "user8",
    sellerName: "Clean Home",
    isPremiumEarlyAccess: false,
  },
  {
    id: "9",
    title: "Rolex Submariner Date (2023 Model)",
    price: 42000,
    originalPrice: 38000,
    currency: "QAR",
    category: "Fashion",
    condition: "New",
    description: "Brand new, unworn, stickers removed by AD. Full set with box and papers dated Nov 2023. Serious buyers only, no time wasters.",
    images: ["https://images.unsplash.com/photo-1639037304383-7c9f802d765f?q=80&w=800&auto=format&fit=crop"],
    location: "West Bay Lagoon",
    postedAt: "2024-12-31T12:00:00Z",
    dealScore: 65,
    riskScore: 40,
    sellerId: "user9",
    sellerName: "Watch Collector",
    isPremiumEarlyAccess: true,
  },
  {
    id: "10",
    title: "Pottery Barn Kids Bed - Kendall Collection",
    price: 1200,
    originalPrice: 3400,
    currency: "QAR",
    category: "Baby & Kids",
    condition: "Good",
    description: "Solid wood twin bed in white. Sturdy and safe. Mattress included if you want (clean, always used with protector). Disassembled and ready for pickup.",
    images: ["https://images.unsplash.com/photo-1505693416388-b034631ac0f3?q=80&w=800&auto=format&fit=crop"],
    location: "Madinat Khalifa",
    postedAt: "2024-12-25T16:00:00Z",
    dealScore: 88,
    riskScore: 0,
    sellerId: "user10",
    sellerName: "Family Moving",
    isPremiumEarlyAccess: false,
  },
  {
    id: "11",
    title: "Sony A7IV Camera Body + 28-70mm Lens",
    price: 7500,
    originalPrice: 9800,
    currency: "QAR",
    category: "Electronics",
    condition: "Like New",
    description: "Shutter count < 5000. Used for one project only. Amazing hybrid camera for photo/video. Comes with extra battery and charger.",
    images: ["https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=800&auto=format&fit=crop"],
    location: "Msheireb Downtown",
    postedAt: "2024-12-30T19:00:00Z",
    dealScore: 82,
    riskScore: 8,
    sellerId: "user11",
    sellerName: "Pro Photographer",
    isPremiumEarlyAccess: false,
  },
  {
    id: "12",
    title: "DeLonghi Dedica Espresso Machine",
    price: 450,
    originalPrice: 899,
    currency: "QAR",
    category: "Appliances",
    condition: "Good",
    description: "Great entry level espresso machine. Slim design fits small kitchens. Includes portafilter and tamper. Works perfectly.",
    images: ["https://images.unsplash.com/photo-1594385208974-2e75f8d7bb48?q=80&w=800&auto=format&fit=crop"],
    location: "Old Airport",
    postedAt: "2024-12-20T10:00:00Z",
    dealScore: 90,
    riskScore: 4,
    sellerId: "user12",
    sellerName: "Coffee Fan",
    isPremiumEarlyAccess: false,
  }
];

export interface DealListener {
  id: string;
  query: string;
  category: string;
  maxPrice: number;
  notifyWhatsapp: boolean;
  createdAt: string;
}

interface AppState {
  listings: Listing[];
  userType: 'free' | 'premium' | 'seller';
  savedListings: string[];
  dealListeners: DealListener[];
  addListing: (listing: Listing) => void;
  toggleSave: (id: string) => void;
  setUserType: (type: 'free' | 'premium' | 'seller') => void;
  addDealListener: (listener: DealListener) => void;
  removeDealListener: (id: string) => void;
  // Auth
  currentUser: { id: string, name: string, phone: string } | null;
  login: (phone: string) => void;
  logout: () => void;
}

export const useStore = create<AppState>((set) => ({
  listings: MOCK_LISTINGS,
  userType: 'premium',
  savedListings: [],
  dealListeners: [
    { id: '1', query: 'iPhone 15 Pro', category: 'Electronics', maxPrice: 3500, notifyWhatsapp: true, createdAt: new Date().toISOString() }
  ],
  // Auth defaults
  currentUser: { id: 'user1', name: 'Mohammed A.', phone: '+974 5555 1234' }, // Default logged in for demo
  
  addListing: (listing) => set((state) => ({ listings: [listing, ...state.listings] })),
  toggleSave: (id) => set((state) => {
    const isSaved = state.savedListings.includes(id);
    return {
      savedListings: isSaved 
        ? state.savedListings.filter(savedId => savedId !== id)
        : [...state.savedListings, id]
    };
  }),
  setUserType: (type) => set({ userType: type }),
  addDealListener: (listener) => set((state) => ({ dealListeners: [...state.dealListeners, listener] })),
  removeDealListener: (id) => set((state) => ({ dealListeners: state.dealListeners.filter(l => l.id !== id) })),
  
  // Auth Actions
  login: (phone) => set({ 
    currentUser: { id: 'user_' + Math.random().toString(36).substr(2, 9), name: 'New User', phone },
    userType: 'free' // Default to free on new login
  }),
  logout: () => set({ currentUser: null, userType: 'free' })
}));
