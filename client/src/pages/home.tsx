import { Layout } from "@/components/layout";
import { DealCard } from "@/components/deal-card";
import { useStore, CATEGORIES, NEIGHBORHOODS } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { SlidersHorizontal, ArrowRight, Zap, Bell, Search, MapPin, X } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  const { listings, userType } = useStore();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 10000]);

  const featuredDeals = listings.filter(l => l.dealScore > 85).slice(0, 3);
  const recentDeals = listings;

  const handleCreateAlert = () => {
    toast({
      title: "Deal Alert Active",
      description: "We'll notify you on WhatsApp when a matching deal is found.",
    });
  };

  const handleApplyFilters = () => {
     setIsFiltersOpen(false);
     toast({
       title: "Filters Applied",
       description: `Showing results for QAR ${priceRange[0]} - ${priceRange[1]}`,
     });
  };

  return (
    <Layout>
      <div className="space-y-10 pb-20">
        
        {/* Hero / Filter Strip */}
        <section className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground tracking-tight">
                Top Deals in <span className="text-primary">Doha</span>
              </h1>
            </div>
            
            <div className="flex items-center gap-2">
               {/* Notify button removed */}
            </div>
          </div>
          
          {/* Enhanced Search & Filters */}
          <div className="space-y-4">
            <div className="relative">
               <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
               <Input 
                 placeholder="Search for 'iPhone 15' or 'Sofa'..." 
                 className="pl-10 h-12 text-lg rounded-xl bg-secondary/30 border-transparent focus:bg-background focus:border-input transition-all"
                 value={searchQuery}
                 onChange={e => setSearchQuery(e.target.value)}
               />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
               <Dialog open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
                 <DialogTrigger asChild>
                   <Button variant="outline" className="rounded-full gap-2 border-dashed border-primary/30 bg-primary/5 hover:bg-primary/10 hover:border-primary shrink-0">
                     <SlidersHorizontal className="h-4 w-4" />
                     Filters
                   </Button>
                 </DialogTrigger>
                 <DialogContent className="max-w-lg p-0 gap-0 overflow-hidden">
                    <DialogHeader className="p-6 pb-2">
                      <DialogTitle className="text-xl font-display">Filter Results</DialogTitle>
                      <DialogDescription>Refine your search to find exactly what you want.</DialogDescription>
                    </DialogHeader>
                    
                    <ScrollArea className="h-[60vh] px-6 py-2">
                      <div className="space-y-8 pb-6">
                        {/* Price Range */}
                        <div className="space-y-4">
                           <div className="flex items-center justify-between">
                             <Label className="text-base font-semibold">Price Range</Label>
                             <span className="text-sm text-muted-foreground tabular-nums">QAR {priceRange[0]} - {priceRange[1]}+</span>
                           </div>
                           <Slider 
                             defaultValue={[0, 10000]} 
                             max={20000} 
                             step={100} 
                             value={priceRange} 
                             onValueChange={setPriceRange}
                             className="py-4"
                           />
                        </div>

                        {/* Condition */}
                        <div className="space-y-3">
                           <Label className="text-base font-semibold">Condition</Label>
                           <div className="grid grid-cols-2 gap-3">
                              {["New (Sealed)", "Like New", "Good", "Fair"].map(c => (
                                <div key={c} className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-secondary/20 transition-colors">
                                  <Checkbox id={c} />
                                  <label htmlFor={c} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1">
                                    {c}
                                  </label>
                                </div>
                              ))}
                           </div>
                        </div>

                        {/* Location */}
                        <div className="space-y-3">
                           <Label className="text-base font-semibold">Neighborhood</Label>
                           <Select>
                             <SelectTrigger className="h-11">
                               <SelectValue placeholder="Any Location" />
                             </SelectTrigger>
                             <SelectContent>
                               <SelectItem value="all">Any Location</SelectItem>
                               {NEIGHBORHOODS.map(n => <SelectItem key={n} value={n}>{n}</SelectItem>)}
                             </SelectContent>
                           </Select>
                        </div>
                        
                        {/* Categories */}
                        <div className="space-y-3">
                           <Label className="text-base font-semibold">Categories</Label>
                           <div className="flex flex-wrap gap-2">
                             {CATEGORIES.map(cat => (
                               <Badge key={cat} variant="outline" className="px-3 py-1.5 cursor-pointer hover:bg-secondary hover:border-secondary-foreground/20 transition-colors text-sm font-normal">
                                 {cat}
                               </Badge>
                             ))}
                           </div>
                        </div>

                        {/* Sort By */}
                        <div className="space-y-3">
                           <Label className="text-base font-semibold">Sort By</Label>
                           <RadioGroup defaultValue="featured">
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="featured" id="r1" />
                                <Label htmlFor="r1">Featured (Deal Score)</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="newest" id="r2" />
                                <Label htmlFor="r2">Newest First</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="price-low" id="r3" />
                                <Label htmlFor="r3">Price: Low to High</Label>
                              </div>
                           </RadioGroup>
                        </div>
                      </div>
                    </ScrollArea>
                    
                    <DialogFooter className="p-6 pt-2 border-t bg-secondary/5">
                       <Button variant="ghost" onClick={() => setIsFiltersOpen(false)} className="mr-auto">Clear All</Button>
                       <Button onClick={handleApplyFilters} className="px-8">Show Results</Button>
                    </DialogFooter>
                 </DialogContent>
               </Dialog>
               
               {CATEGORIES.map(cat => (
                 <Button key={cat} variant="secondary" className="rounded-full bg-secondary/50 hover:bg-secondary whitespace-nowrap shrink-0">
                   {cat}
                 </Button>
               ))}
            </div>
          </div>
        </section>

        {/* Premium Teaser (if free user) */}
        {userType === 'free' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-gradient-to-r from-primary/90 to-primary p-6 md:p-8 text-primary-foreground relative overflow-hidden shadow-xl"
          >
             {/* Abstract background elements */}
             <div className="absolute top-0 right-0 w-64 h-64 bg-accent/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
             
             <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
               <div className="max-w-xl space-y-2">
                 <div className="inline-flex items-center gap-2 rounded-full bg-background/20 backdrop-blur-md px-3 py-1 text-xs font-medium text-white border border-white/20">
                   <Zap className="h-3 w-3 text-accent" />
                   <span>Early Access</span>
                 </div>
                 <h3 className="text-2xl font-display font-bold">Don't miss the best deals</h3>
                 <p className="text-primary-foreground/80 leading-relaxed">
                   Premium members see high-score deals 3 hours before everyone else. 
                   <br className="hidden md:block"/> Get instant alerts when your dream item is listed.
                 </p>
               </div>
               <Button size="lg" className="bg-white text-primary hover:bg-accent hover:text-accent-foreground font-semibold shadow-lg transition-all shrink-0">
                 Upgrade to Premium
               </Button>
             </div>
          </motion.div>
        )}

        {/* Featured Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
             <h2 className="text-xl font-display font-semibold flex items-center gap-2">
               <Zap className="h-5 w-5 text-accent fill-accent" /> Premium Deal Center
             </h2>
             <Button variant="ghost" className="text-primary hover:text-primary/80 gap-1">
               View all <ArrowRight className="h-4 w-4" />
             </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredDeals.map((listing) => (
              <DealCard key={listing.id} listing={listing} />
            ))}
          </div>
        </section>

        {/* Recent Feed */}
        <section className="space-y-4">
          <h2 className="text-xl font-display font-semibold">Fresh Finds</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
             {recentDeals.map((listing) => (
              <DealCard key={listing.id} listing={listing} />
            ))}
          </div>
        </section>
      </div>
    </Layout>
  );
}
