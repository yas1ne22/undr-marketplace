import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Check, Star, Zap, Shield, Search } from "lucide-react";
import generatedImage from '@assets/generated_images/abstract_premium_gold_and_teal_texture.png';

export default function Premium() {
  return (
    <Layout>
      <div className="pb-20">
        {/* Hero Header */}
        <div className="relative rounded-3xl overflow-hidden mb-12 text-center py-24 px-6">
           <div 
             className="absolute inset-0 z-0 opacity-100"
             style={{ 
               backgroundImage: `url(${generatedImage})`,
               backgroundSize: 'cover',
               backgroundPosition: 'center'
             }}
           >
             <div className="absolute inset-0 bg-teal-900/40 backdrop-blur-[2px] mix-blend-multiply" />
           </div>
           
           <div className="relative z-10 space-y-6 max-w-2xl mx-auto">
             <div className="inline-flex items-center gap-2 rounded-full bg-accent/20 border border-accent/40 backdrop-blur-md px-4 py-1.5 text-sm font-bold text-accent-foreground">
               <Star className="h-4 w-4 fill-current" />
               <span>Doha Deals Premium</span>
             </div>
             <h1 className="text-4xl md:text-6xl font-display font-bold text-white tracking-tight drop-shadow-sm">
               Never miss a <br/><span className="text-accent">perfect deal</span> again.
             </h1>
             <p className="text-lg md:text-xl text-white/90 font-medium">
               Get a 3-hour head start on the best listings in Doha.
             </p>
           </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
           {/* Free Tier */}
           <div className="rounded-3xl border p-8 space-y-6 bg-card relative overflow-hidden">
              <div className="space-y-2">
                <h3 className="text-2xl font-bold">Standard</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-display font-bold">Free</span>
                  <span className="text-muted-foreground">/ forever</span>
                </div>
                <p className="text-muted-foreground">Great for casual browsing.</p>
              </div>
              <ul className="space-y-4 pt-4">
                <li className="flex items-center gap-3">
                  <div className="h-6 w-6 rounded-full bg-secondary flex items-center justify-center shrink-0">
                    <Check className="h-3.5 w-3.5" />
                  </div>
                  <span>Browse all listings</span>
                </li>
                 <li className="flex items-center gap-3">
                  <div className="h-6 w-6 rounded-full bg-secondary flex items-center justify-center shrink-0">
                    <Check className="h-3.5 w-3.5" />
                  </div>
                  <span>Contact sellers</span>
                </li>
                 <li className="flex items-center gap-3">
                  <div className="h-6 w-6 rounded-full bg-secondary flex items-center justify-center shrink-0">
                    <Check className="h-3.5 w-3.5" />
                  </div>
                  <span>Basic search filters</span>
                </li>
              </ul>
              <Button variant="outline" className="w-full mt-auto" size="lg">Current Plan</Button>
           </div>

           {/* Premium Tier */}
           <div className="rounded-3xl border-2 border-accent/50 p-8 space-y-6 bg-card relative overflow-hidden shadow-2xl shadow-accent/10">
              <div className="absolute top-0 right-0 bg-accent text-accent-foreground px-4 py-1 rounded-bl-xl text-xs font-bold uppercase tracking-wider">
                Recommended
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-primary">Premium</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-display font-bold">QAR 29</span>
                  <span className="text-muted-foreground">/ month</span>
                </div>
                <p className="text-muted-foreground">For serious deal hunters.</p>
              </div>
              <ul className="space-y-4 pt-4">
                <li className="flex items-center gap-3">
                  <div className="h-6 w-6 rounded-full bg-accent/20 text-accent-foreground flex items-center justify-center shrink-0">
                    <Zap className="h-3.5 w-3.5 fill-current" />
                  </div>
                  <span className="font-medium">3-Hour Early Access to new deals</span>
                </li>
                 <li className="flex items-center gap-3">
                  <div className="h-6 w-6 rounded-full bg-accent/20 text-accent-foreground flex items-center justify-center shrink-0">
                    <Shield className="h-3.5 w-3.5" />
                  </div>
                  <span>Advanced Risk Analysis Reports</span>
                </li>
                 <li className="flex items-center gap-3">
                  <div className="h-6 w-6 rounded-full bg-accent/20 text-accent-foreground flex items-center justify-center shrink-0">
                    <Search className="h-3.5 w-3.5" />
                  </div>
                  <span>Unlimited Saved Search Alerts</span>
                </li>
              </ul>
              <Button className="w-full mt-auto bg-primary hover:bg-primary/90 text-white font-bold" size="lg">
                Start 7-Day Free Trial
              </Button>
           </div>
        </div>
      </div>
    </Layout>
  );
}
