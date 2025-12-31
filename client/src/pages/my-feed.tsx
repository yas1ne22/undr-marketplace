import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { useStore, DealListener, CATEGORIES, Listing } from "@/lib/mockData";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Zap, Bell, Settings, Plus, Trash2, Edit2, ThumbsUp, ThumbsDown, SlidersHorizontal, ArrowRight, Bot, Sparkles, X } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { DealScoreBadge, RiskBadge } from "@/components/deal-score-badge";
import { formatDistanceToNow, addHours, format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

export default function MyFeed() {
  const { listings, dealListeners, addDealListener, removeDealListener } = useStore();
  const [activeTab, setActiveTab] = useState("feed");
  const { toast } = useToast();

  // Mock deals matching listeners (for "Hot Deals" section)
  // In a real app, this would filter based on listener queries
  const matchingDeals = listings.slice(0, 3); 
  const [swipedDeals, setSwipedDeals] = useState<string[]>([]);
  
  const visibleDeals = matchingDeals.filter(d => !swipedDeals.includes(d.id));

  return (
    <Layout>
      <div className="flex flex-col lg:flex-row gap-8 pb-20">
        
        {/* Sidebar Navigation (Desktop) */}
        <aside className="hidden lg:block w-64 shrink-0 space-y-2 sticky top-24 h-fit">
           <Button 
             variant={activeTab === "feed" ? "secondary" : "ghost"} 
             className="w-full justify-start gap-2 text-lg font-medium h-12"
             onClick={() => setActiveTab("feed")}
           >
             <Zap className="h-5 w-5 text-accent" />
             Hot Deals
             <Badge className="ml-auto bg-accent text-accent-foreground">3</Badge>
           </Button>
           <Button 
             variant={activeTab === "listeners" ? "secondary" : "ghost"} 
             className="w-full justify-start gap-2 text-lg font-medium h-12"
             onClick={() => setActiveTab("listeners")}
           >
             <Bell className="h-5 w-5" />
             Deal Listeners
           </Button>
           <Button 
             variant={activeTab === "settings" ? "secondary" : "ghost"} 
             className="w-full justify-start gap-2 text-lg font-medium h-12"
             onClick={() => setActiveTab("settings")}
           >
             <Settings className="h-5 w-5" />
             Settings
           </Button>
        </aside>

        {/* Mobile Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="lg:hidden w-full">
           <TabsList className="grid grid-cols-3 w-full mb-6">
             <TabsTrigger value="feed">Hot Deals</TabsTrigger>
             <TabsTrigger value="listeners">Listeners</TabsTrigger>
             <TabsTrigger value="settings">Settings</TabsTrigger>
           </TabsList>
        </Tabs>

        {/* Main Content Area */}
        <div className="flex-1 min-w-0">
          
          {/* FEED SECTION */}
          {activeTab === "feed" && (
            <div className="space-y-8 max-w-2xl mx-auto">
               <div className="space-y-2">
                 <h2 className="text-3xl font-display font-bold">Waiting for You</h2>
                 <p className="text-muted-foreground">Deals matching your listeners, sorted by score.</p>
               </div>

               <div className="space-y-6">
                 <AnimatePresence>
                   {visibleDeals.length > 0 ? (
                     visibleDeals.map((deal) => (
                       <FeedDealCard 
                         key={deal.id} 
                         deal={deal} 
                         onSwipe={(dir) => {
                           setSwipedDeals(prev => [...prev, deal.id]);
                           toast({
                             title: dir === 'right' ? "Saved to Interested" : "Dismissed",
                             duration: 1500,
                           });
                         }} 
                       />
                     ))
                   ) : (
                     <motion.div 
                       initial={{ opacity: 0 }} 
                       animate={{ opacity: 1 }}
                       className="text-center py-20 bg-secondary/20 rounded-3xl border border-dashed"
                     >
                        <div className="mx-auto h-16 w-16 rounded-full bg-secondary flex items-center justify-center mb-4">
                          <Check className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-xl font-bold">All caught up!</h3>
                        <p className="text-muted-foreground mt-2">We'll notify you when new deals arrive.</p>
                     </motion.div>
                   )}
                 </AnimatePresence>
               </div>
            </div>
          )}

          {/* LISTENERS SECTION */}
          {activeTab === "listeners" && (
            <div className="space-y-8">
               <div className="flex items-center justify-between">
                 <div>
                   <h2 className="text-3xl font-display font-bold">Deal Listeners</h2>
                   <p className="text-muted-foreground">Manage your AI alerts.</p>
                 </div>
                 <CreateListenerDialog onCreate={addDealListener} />
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {dealListeners.map((listener) => (
                   <Card key={listener.id} className="group relative overflow-hidden transition-all hover:border-accent/50">
                      <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                         <Button variant="ghost" size="icon" className="h-8 w-8"><Edit2 className="h-4 w-4" /></Button>
                         <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => removeDealListener(listener.id)}>
                           <Trash2 className="h-4 w-4" />
                         </Button>
                      </div>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                          {listener.query}
                          {listener.notifyWhatsapp && <Badge variant="secondary" className="text-[10px] bg-green-100 text-green-700 hover:bg-green-100">WhatsApp Active</Badge>}
                        </CardTitle>
                        <CardDescription>
                          {listener.category} • Max QAR {listener.maxPrice}
                        </CardDescription>
                      </CardHeader>
                      <CardFooter className="bg-secondary/20 py-3">
                         <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Bot className="h-3 w-3" />
                            <span>AI is listening for new listings...</span>
                         </div>
                      </CardFooter>
                   </Card>
                 ))}
                 
                 {/* Add New Card Button */}
                 <CreateListenerDialog onCreate={addDealListener} trigger={
                    <button className="flex flex-col items-center justify-center gap-3 p-8 rounded-xl border-2 border-dashed border-secondary hover:border-accent/50 hover:bg-accent/5 transition-all text-muted-foreground hover:text-accent-foreground h-full min-h-[160px]">
                      <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center">
                        <Plus className="h-6 w-6" />
                      </div>
                      <span className="font-medium">Create New Listener</span>
                    </button>
                 } />
               </div>
            </div>
          )}
          
           {/* SETTINGS SECTION (Placeholder) */}
           {activeTab === "settings" && (
             <div className="space-y-6">
                <h2 className="text-3xl font-display font-bold">Settings</h2>
                <Card>
                  <CardHeader>
                    <CardTitle>Notification Preferences</CardTitle>
                    <CardDescription>Manage how you want to be notified.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                     <div className="flex items-center justify-between">
                       <Label>Push Notifications</Label>
                       <Checkbox defaultChecked />
                     </div>
                     <div className="flex items-center justify-between">
                       <Label>WhatsApp Alerts</Label>
                       <Checkbox defaultChecked />
                     </div>
                     <div className="flex items-center justify-between">
                       <Label>Email Digest</Label>
                       <Checkbox />
                     </div>
                  </CardContent>
                </Card>
             </div>
           )}

        </div>
      </div>
    </Layout>
  );
}

// Sub-component: Feed Deal Card
function FeedDealCard({ deal, onSwipe }: { deal: Listing, onSwipe: (dir: 'left' | 'right') => void }) {
  const [, setLocation] = useLocation();
  const unlockTime = addHours(new Date(), 2);
  
  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, x: 100, transition: { duration: 0.2 } }}
      className="bg-card border rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow relative"
    >
      <div className="absolute top-3 right-3 z-10">
         <Badge className="bg-accent text-accent-foreground border-accent/20 shadow-sm font-bold tracking-wide">
           PRO EXCLUSIVE
         </Badge>
      </div>

      <div className="flex flex-col md:flex-row cursor-pointer" onClick={() => setLocation(`/listing/${deal.id}`)}>
         <div className="relative md:w-2/5 aspect-[4/3] md:aspect-auto">
             <img src={deal.images[0]} className="w-full h-full object-cover" />
             <div className="absolute top-2 left-2">
                <Badge className="bg-primary/90 backdrop-blur-sm text-white border-0">
                  Matched "iPhone"
                </Badge>
             </div>
         </div>
         <div className="p-6 flex-1 flex flex-col">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="text-xl font-bold font-display group-hover:text-primary transition-colors">{deal.title}</h3>
                <p className="text-sm text-muted-foreground">{deal.location} • {formatDistanceToNow(new Date(deal.postedAt))} ago</p>
              </div>
              <DealScoreBadge score={deal.dealScore} />
            </div>
            
            <div className="mt-auto pt-6 flex items-end justify-between">
              <div>
                 <div className="text-2xl font-bold text-primary">{deal.currency} {deal.price}</div>
                 <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <span>Usually</span>
                    <span className="line-through decoration-destructive/40 font-medium">{deal.originalPrice}</span>
                 </div>
              </div>
              
              <div className="flex gap-3" onClick={(e) => e.stopPropagation()}>
                 <Button 
                   size="icon" 
                   variant="outline" 
                   className="rounded-full h-12 w-12 border-2 hover:bg-destructive/10 hover:border-destructive hover:text-destructive transition-colors"
                   onClick={() => onSwipe('left')}
                 >
                   <ThumbsDown className="h-5 w-5" />
                 </Button>
                 <Button 
                   size="icon" 
                   className="rounded-full h-12 w-12 bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20"
                   onClick={() => onSwipe('right')}
                 >
                   <ThumbsUp className="h-5 w-5" />
                 </Button>
              </div>
            </div>
         </div>
      </div>
    </motion.div>
  );
}

// Sub-component: Create Listener Dialog
import { Check } from "lucide-react";

function CreateListenerDialog({ onCreate, trigger }: { onCreate: (l: DealListener) => void, trigger?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [query, setQuery] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [isTuning, setIsTuning] = useState(false);

  const handleCreate = () => {
    setIsTuning(true);
    // Simulate AI tuning
    setTimeout(() => {
       setIsTuning(false);
       onCreate({
         id: Math.random().toString(),
         query: query || "New Alert",
         category: "General",
         maxPrice: parseInt(maxPrice) || 0,
         notifyWhatsapp: true,
         createdAt: new Date().toISOString()
       });
       setOpen(false);
       setStep(1);
       setQuery("");
    }, 1500);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
           <Button className="gap-2 rounded-full">
             <Plus className="h-4 w-4" />
             New Listener
           </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
         {isTuning ? (
           <div className="py-12 text-center space-y-4">
             <div className="relative mx-auto h-20 w-20">
               <div className="absolute inset-0 bg-accent/20 rounded-full animate-ping" />
               <div className="relative h-20 w-20 bg-accent/10 rounded-full flex items-center justify-center text-accent">
                 <Sparkles className="h-10 w-10 animate-pulse" />
               </div>
             </div>
             <h3 className="text-xl font-bold">AI is tuning your listener...</h3>
             <p className="text-muted-foreground">Scanning recent sales data to set optimal thresholds.</p>
           </div>
         ) : (
           <>
             <DialogHeader>
               <DialogTitle className="text-xl font-display">Create Deal Listener</DialogTitle>
               <DialogDescription>
                 Tell our AI what you're looking for. We'll find it for you.
               </DialogDescription>
             </DialogHeader>
             
             <div className="py-6 space-y-6">
                <div className="space-y-2">
                   <Label>What are you looking for?</Label>
                   <Input 
                     placeholder="e.g. Herman Miller Chair, iPhone 14..." 
                     className="text-lg h-12"
                     value={query}
                     onChange={e => setQuery(e.target.value)}
                     autoFocus
                   />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                     <Label>Max Price (QAR)</Label>
                     <Input 
                       placeholder="Any" 
                       type="number"
                       value={maxPrice}
                       onChange={e => setMaxPrice(e.target.value)}
                     />
                   </div>
                   <div className="space-y-2">
                     <Label>Condition</Label>
                     <Select defaultValue="any">
                       <SelectTrigger>
                         <SelectValue placeholder="Any condition" />
                       </SelectTrigger>
                       <SelectContent>
                         <SelectItem value="any">Any Condition</SelectItem>
                         <SelectItem value="new">Like New or better</SelectItem>
                       </SelectContent>
                     </Select>
                   </div>
                </div>

                <div className="bg-secondary/20 p-4 rounded-xl flex items-center gap-3 border border-secondary">
                   <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 shrink-0">
                     <Zap className="h-5 w-5 fill-current" />
                   </div>
                   <div className="flex-1">
                      <p className="font-medium text-sm">Instant WhatsApp Alerts</p>
                      <p className="text-xs text-muted-foreground">Get notified the second a deal drops.</p>
                   </div>
                   <Checkbox defaultChecked />
                </div>
             </div>

             <DialogFooter>
                <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={handleCreate} disabled={!query} className="bg-primary text-white">
                  Start Listening
                </Button>
             </DialogFooter>
           </>
         )}
      </DialogContent>
    </Dialog>
  );
}
