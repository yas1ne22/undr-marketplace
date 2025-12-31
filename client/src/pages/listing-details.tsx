import { useRoute, Link, useLocation } from "wouter";
import { useStore } from "@/lib/mockData";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DealScoreBadge, RiskBadge } from "@/components/deal-score-badge";
import { ArrowLeft, Share2, Heart, MessageSquare, ShieldCheck, AlertTriangle, CheckCircle2, MapPin, Zap, Lock, ChevronLeft, ChevronRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import NotFound from "./not-found";
import { useState } from "react";
import { DealCard } from "@/components/deal-card";

export default function ListingDetails() {
  const [, params] = useRoute("/listing/:id");
  const [, setLocation] = useLocation();
  const { listings, toggleSave, savedListings } = useStore();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const listing = listings.find(l => l.id === params?.id);
  
  if (!listing) return <NotFound />;

  const isSaved = savedListings.includes(listing.id);
  const similarListings = listings.filter(l => l.category === listing.category && l.id !== listing.id).slice(0, 3);

  const handleContactSeller = () => {
    setLocation(`/inbox?listing=${listing.id}&msg=Hi, I'm interested.`);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % listing.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + listing.images.length) % listing.images.length);
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto pb-20">
        <div className="mb-6 flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2 pl-0 hover:bg-transparent hover:text-primary">
              <ArrowLeft className="h-4 w-4" /> Back to Deals
            </Button>
          </Link>
          {listing.isPremiumEarlyAccess && (
            <Badge className="bg-accent/10 text-accent-foreground border-accent/20 gap-1.5 py-1.5 px-3">
              <Zap className="h-3.5 w-3.5 fill-current" />
              PRO EXCLUSIVE
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Images & Key Info */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image Gallery */}
            <div className="rounded-3xl overflow-hidden aspect-[4/3] bg-secondary relative shadow-sm border border-border/50 group">
              <img 
                src={listing.images[currentImageIndex]} 
                alt={listing.title} 
                className="w-full h-full object-cover transition-opacity duration-300"
              />
              
              {/* Navigation Arrows */}
              {listing.images.length > 1 && (
                <>
                  <Button 
                    variant="secondary" 
                    size="icon" 
                    className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-background/80 backdrop-blur opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={prevImage}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <Button 
                    variant="secondary" 
                    size="icon" 
                    className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-background/80 backdrop-blur opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={nextImage}
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </>
              )}

              {/* Dots Indicator */}
              {listing.images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {listing.images.map((_, idx) => (
                    <div 
                      key={idx} 
                      className={`h-2 w-2 rounded-full transition-all ${idx === currentImageIndex ? "bg-white w-4" : "bg-white/50"}`} 
                    />
                  ))}
                </div>
              )}

              {listing.isPremiumEarlyAccess && (
                 <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-accent to-accent/50" />
              )}
              <div className="absolute top-4 right-4 flex gap-2">
                 <Button 
                   size="icon" 
                   variant="secondary" 
                   className="rounded-full bg-background/80 backdrop-blur-md hover:bg-background shadow-sm"
                   onClick={() => toggleSave(listing.id)}
                 >
                   <Heart className={`h-5 w-5 ${isSaved ? "fill-red-500 text-red-500" : "text-foreground"}`} />
                 </Button>
                 <Button size="icon" variant="secondary" className="rounded-full bg-background/80 backdrop-blur-md hover:bg-background shadow-sm">
                   <Share2 className="h-5 w-5" />
                 </Button>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-4">
               <div className="flex items-start justify-between">
                 <div>
                    <h1 className="text-3xl font-display font-bold leading-tight">{listing.title}</h1>
                    <div className="flex items-center gap-2 mt-2 text-muted-foreground text-sm">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" /> {listing.location}
                      </span>
                      <span>•</span>
                      <span>Posted {formatDistanceToNow(new Date(listing.postedAt))} ago</span>
                    </div>
                 </div>
                 <div className="text-right">
                    <div className="text-3xl font-bold text-primary">{listing.currency} {listing.price.toLocaleString()}</div>
                    <div className="flex items-center justify-end gap-1.5 text-sm text-muted-foreground mt-1">
                      <span>Usually</span>
                      <span className="line-through decoration-destructive/40 font-medium">{listing.originalPrice.toLocaleString()}</span>
                    </div>
                 </div>
               </div>

               <div className="flex flex-wrap gap-2 py-4 border-y border-dashed">
                 <Badge variant="secondary" className="px-3 py-1 text-sm font-medium bg-secondary/50">Condition: {listing.condition}</Badge>
                 <Badge variant="secondary" className="px-3 py-1 text-sm font-medium bg-secondary/50">{listing.category}</Badge>
               </div>

               <div className="prose prose-sm md:prose-base max-w-none text-muted-foreground">
                 <p className="whitespace-pre-line">{listing.description}</p>
               </div>
            </div>

            {/* Similar Products */}
            {similarListings.length > 0 && (
              <div className="pt-8 border-t">
                <h3 className="text-xl font-display font-bold mb-4">Similar Listings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {similarListings.map(item => (
                    <DealCard key={item.id} listing={item} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Deal Agent Analysis */}
          <div className="space-y-6">
            <div className="rounded-2xl border bg-card p-6 shadow-sm space-y-6 sticky top-24">
               {/* Deal Score */}
               <div className="flex items-center justify-between">
                 <div>
                   <h3 className="font-display font-semibold text-lg">Deal Score</h3>
                   <p className="text-xs text-muted-foreground">AI-calculated value analysis</p>
                 </div>
                 <DealScoreBadge score={listing.dealScore} size="lg" />
               </div>

               {/* Why it's a deal */}
               <div className="space-y-3">
                 <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">Why it's a deal</h4>
                 <div className="space-y-2">
                   <div className="flex gap-3 items-start p-3 rounded-lg bg-green-50/50 border border-green-100 dark:bg-green-900/10 dark:border-green-900/20">
                     <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                     <div className="space-y-1">
                       <p className="text-sm font-medium text-green-900 dark:text-green-100">Price is 15% below market</p>
                       <p className="text-xs text-green-700 dark:text-green-300">Based on similar items in {listing.location}</p>
                     </div>
                   </div>
                   <div className="flex gap-3 items-start p-3 rounded-lg bg-blue-50/50 border border-blue-100 dark:bg-blue-900/10 dark:border-blue-900/20">
                     <ShieldCheck className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                     <div className="space-y-1">
                       <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Trusted Seller</p>
                       <p className="text-xs text-blue-700 dark:text-blue-300">Phone verified, 4.8/5 rating</p>
                     </div>
                   </div>
                 </div>
               </div>

               {/* Risk Analysis */}
               <div className="space-y-3 pt-4 border-t">
                  <div className="flex items-center justify-between">
                     <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">Risk Analysis</h4>
                     <RiskBadge score={listing.riskScore} />
                  </div>
                  {listing.riskScore > 10 ? (
                    <div className="flex gap-3 items-start p-3 rounded-lg bg-orange-50/50 border border-orange-100 dark:bg-orange-900/10 dark:border-orange-900/20">
                      <AlertTriangle className="h-5 w-5 text-orange-600 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-orange-900 dark:text-orange-100">Price seems too low</p>
                        <p className="text-xs text-orange-700 dark:text-orange-300">Verify item in person before paying.</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">No significant risks detected.</p>
                  )}
               </div>
               
               {/* Seller Action */}
               <div className="pt-4 space-y-3">
                  <Button size="lg" className="w-full gap-2 font-semibold bg-primary hover:bg-primary/90" onClick={handleContactSeller}>
                    <MessageSquare className="h-4 w-4" />
                    Chat with {listing.sellerName}
                  </Button>
                  <p className="text-xs text-center text-muted-foreground">
                    Avg. response time: <span className="font-medium text-foreground">15 mins</span>
                  </p>
               </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
