import { Layout } from "@/components/layout";
import { useStore } from "@/lib/mockData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowUpRight, TrendingUp, Users, Eye, MousePointerClick, MessageSquare, Plus, Package } from "lucide-react";
import { Link } from "wouter";
import { DealCard } from "@/components/deal-card";

export default function Profile() {
  const { listings, userType } = useStore();
  
  // Filter listings for "me"
  const myListings = listings.filter(l => l.sellerId === "me");
  
  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-8 pb-20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-display font-bold">My Account</h1>
            <p className="text-muted-foreground">Manage your listings and performance.</p>
          </div>
          <Button asChild size="lg" className="gap-2">
            <Link href="/sell/new">
              <Plus className="h-4 w-4" /> Post New Item
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <Card className="bg-primary/5 border-primary/20 shadow-sm">
             <CardHeader className="pb-2">
               <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                 <Users className="h-4 w-4 text-primary" /> Total Views
               </CardTitle>
             </CardHeader>
             <CardContent>
               <div className="text-3xl font-bold">1,248</div>
               <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                 <TrendingUp className="h-3 w-3 text-green-600" /> 
                 <span className="text-green-600 font-medium">+12%</span> from last week
               </p>
             </CardContent>
           </Card>
           
           <Card>
             <CardHeader className="pb-2">
               <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                 <MousePointerClick className="h-4 w-4 text-primary" /> Interest
               </CardTitle>
             </CardHeader>
             <CardContent>
               <div className="text-3xl font-bold">86</div>
               <p className="text-xs text-muted-foreground mt-1">Clicks on "Contact"</p>
             </CardContent>
           </Card>
           
           <Card>
             <CardHeader className="pb-2">
               <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                 <MessageSquare className="h-4 w-4 text-primary" /> Active Chats
               </CardTitle>
             </CardHeader>
             <CardContent>
               <div className="text-3xl font-bold">12</div>
               <p className="text-xs text-muted-foreground mt-1">3 pending replies</p>
             </CardContent>
           </Card>
        </div>

        <Tabs defaultValue="active" className="w-full">
          <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent gap-6">
            <TabsTrigger 
              value="active" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 py-3 font-semibold"
            >
              Active Listings ({myListings.length})
            </TabsTrigger>
            <TabsTrigger 
              value="sold" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 py-3 font-semibold"
            >
              Sold History
            </TabsTrigger>
            <TabsTrigger 
              value="insights" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 py-3 font-semibold"
            >
              AI Insights
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="active" className="pt-6">
             {myListings.length > 0 ? (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {myListings.map(listing => (
                   <div key={listing.id} className="relative group">
                     <DealCard listing={listing} />
                     <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                       <Button size="sm" variant="secondary" className="backdrop-blur-md">Edit</Button>
                       <Button size="sm" variant="secondary" className="backdrop-blur-md">Promote</Button>
                     </div>
                   </div>
                 ))}
               </div>
             ) : (
               <div className="text-center py-20 border-2 border-dashed rounded-xl bg-secondary/5">
                 <div className="h-16 w-16 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                   <Package className="h-8 w-8 text-muted-foreground" />
                 </div>
                 <h3 className="text-lg font-medium mb-2">No active listings</h3>
                 <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                   Start selling your unused items today. It takes less than 2 minutes.
                 </p>
                 <Button asChild>
                   <Link href="/sell/new">Post Your First Item</Link>
                 </Button>
               </div>
             )}
          </TabsContent>
          
          <TabsContent value="sold" className="pt-6">
             <div className="text-center py-12 text-muted-foreground">
               No sold items yet.
             </div>
          </TabsContent>
          
          <TabsContent value="insights" className="pt-6">
             <Card>
               <CardHeader>
                 <CardTitle className="flex items-center gap-2">
                   <Sparkles className="h-5 w-5 text-accent" /> AI Recommendations
                 </CardTitle>
               </CardHeader>
               <CardContent className="space-y-4">
                 <div className="p-4 rounded-lg bg-accent/5 border border-accent/10 flex items-start gap-4">
                   <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                     <TrendingUp className="h-5 w-5 text-accent" />
                   </div>
                   <div>
                     <h4 className="font-semibold">Price Optimization</h4>
                     <p className="text-sm text-muted-foreground mt-1">
                       Lowering the price of "iPhone 15 Pro" by QAR 100 could increase views by 25% based on current market trends.
                     </p>
                     <Button size="sm" variant="outline" className="mt-3">Apply Suggestion</Button>
                   </div>
                 </div>
               </CardContent>
             </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}

function Sparkles({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="M5 3v4" />
      <path d="M9 3v4" />
      <path d="M3 9h4" />
      <path d="M3 5h4" />
    </svg>
  );
}