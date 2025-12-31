import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { useStore, CATEGORIES, NEIGHBORHOODS, Listing } from "@/lib/mockData";
import { generateDescription, scoreDeal, suggestPriceRange } from "@/services/ai";
import { Loader2, Upload, Sparkles, Check, ChevronRight, ChevronLeft, DollarSign, Bot, Search, MapPin, Crosshair, TrendingDown, Users, ArrowRight, RefreshCw, Wand2, AlignLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const AI_ANALYSIS_STEPS = [
  "Scanning image structure...",
  "Identifying object...",
  "Detecting condition & wear...",
  "Estimating market value...",
  "Drafting details..."
];

const STEPS = [
  { id: 1, label: "Photos" },
  { id: 2, label: "Details" },
  { id: 3, label: "Specs" },
  { id: 4, label: "AI Assist" },
  { id: 5, label: "Agent" },
  { id: 6, label: "Review" },
];

export default function SellWizard() {
  const [, setLocation] = useLocation();
  const { addListing } = useStore();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  const [analysisStepIndex, setAnalysisStepIndex] = useState(0);
  const [dealAnalysis, setDealAnalysis] = useState<{score: number, risk: number} | null>(null);
  const [enableAiAgent, setEnableAiAgent] = useState(true);
  const [categoryOpen, setCategoryOpen] = useState(false);
  
  // AI Agent Preferences
  const [agentPrefs, setAgentPrefs] = useState({
    autoReply: true,
    minOffer: "",
    scheduleViewings: false
  });

  const [formData, setFormData] = useState({
    title: "",
    category: "",
    condition: "",
    price: "",
    originalPrice: "",
    description: "",
    location: "",
    images: [] as string[]
  });
  
  const [aiSuggestedPrice, setAiSuggestedPrice] = useState<string | null>(null);
  const [aiSuggestedOriginalPrice, setAiSuggestedOriginalPrice] = useState<string | null>(null);

  // Real-time score update
  useEffect(() => {
    if (step === 6) {
      const updateScore = async () => {
        const price = parseInt(formData.price) || 0;
        const original = parseInt(formData.originalPrice) || price * 1.5;
        const analysis = await scoreDeal(price, original);
        setDealAnalysis({ score: analysis.dealScore, risk: analysis.riskScore });
      };
      // Debounce slightly to avoid rapid updates
      const timer = setTimeout(updateScore, 300);
      return () => clearTimeout(timer);
    }
  }, [formData.price, formData.originalPrice, step]);

  const handleNext = async () => {
    if (step === 1 && formData.images.length > 0 && !formData.condition) {
       // Simulate AI Image Analysis with detailed steps
       setIsAnalyzingImage(true);
       setAnalysisStepIndex(0);
       
       // Cycle through steps
       for (let i = 0; i < AI_ANALYSIS_STEPS.length; i++) {
          setAnalysisStepIndex(i);
          await new Promise(r => setTimeout(r, 800)); // Wait 800ms per step
       }

       setIsAnalyzingImage(false);
       // Auto-fill condition and category mock
       setFormData(prev => ({ 
         ...prev, 
         condition: "Like New",
         category: prev.category || "Electronics", // Keep existing or default
         title: prev.title || "iPhone 15 Pro Max (Detected)"
       }));
       setStep(2);
       toast({
         title: "Analysis Complete",
         description: "We've detected your item and suggested some details.",
       });
       return;
    }

    // Before Deal Optimization Step - Calculate Initial Score
    if (step === 5) { 
       setIsGenerating(true);
       const price = parseInt(formData.price) || 0;
       const original = parseInt(formData.originalPrice) || price * 1.5;
       const analysis = await scoreDeal(price, original);
       setDealAnalysis({ score: analysis.dealScore, risk: analysis.riskScore });
       setIsGenerating(false);
       setStep(6);
       return;
    } 
    
    // Final Publish
    if (step === 6) { 
       const newListing: Listing = {
         id: Math.random().toString(36).substring(7),
         ...formData,
         price: parseInt(formData.price),
         originalPrice: parseInt(formData.originalPrice) || parseInt(formData.price),
         currency: "QAR",
         condition: formData.condition as any,
         images: formData.images.length > 0 ? formData.images : ["https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?q=80&w=800&auto=format&fit=crop"], // Mock image
         postedAt: new Date().toISOString(),
         sellerId: "me",
         sellerName: "You",
         isPremiumEarlyAccess: false,
         dealScore: dealAnalysis?.score || 80,
         riskScore: dealAnalysis?.risk || 5,
       };
       addListing(newListing);
       setStep(7); // Success Screen
       return;
    }

    setStep(s => s + 1);
  };

  const handleImageUpload = () => {
    // Mock upload
    setFormData(prev => ({
       ...prev, 
       images: ["https://images.unsplash.com/photo-1696446701796-da61225697cc?q=80&w=800&auto=format&fit=crop"]
    }));
  };

  const handleLocateMe = () => {
    toast({ title: "Locating...", description: "Using GPS to find your neighborhood." });
    setTimeout(() => {
      setFormData(prev => ({ ...prev, location: "West Bay" }));
      toast({ title: "Location Found", description: "Set to West Bay based on GPS." });
    }, 1000);
  };

  const handleAIAutoFill = async () => {
    setIsGenerating(true);
    const desc = await generateDescription(formData.title, formData.category);
    const prices = await suggestPriceRange(formData.category, formData.condition);
    
    setFormData(prev => ({
      ...prev,
      description: desc,
      price: prices.recommended.toString(),
      originalPrice: (prices.recommended * 1.3).toFixed(0)
    }));
    setAiSuggestedPrice(prices.recommended.toString());
    setAiSuggestedOriginalPrice((prices.recommended * 1.3).toFixed(0));
    setIsGenerating(false);
    toast({
      title: "AI Suggestion Applied",
      description: "Description and price range have been auto-filled.",
    });
  };

  const modifyDescription = (type: 'rewrite' | 'shorten' | 'professional') => {
    setIsGenerating(true);
    setTimeout(() => {
        let newDesc = formData.description;
        if (type === 'rewrite') newDesc = "Experience premium performance with this iPhone 15 Pro Max. Kept in pristine condition with minimal signs of use. Includes original box and accessories. Perfect for photography enthusiasts and power users.";
        if (type === 'shorten') newDesc = "iPhone 15 Pro Max. Excellent condition. Includes box. Great battery life.";
        if (type === 'professional') newDesc = "For Sale: iPhone 15 Pro Max in Like New condition. This device has been meticulously maintained and functions perfectly. A premium choice for those seeking top-tier performance.";
        
        setFormData(prev => ({ ...prev, description: newDesc }));
        setIsGenerating(false);
    }, 800);
  };

  const applyOptimization = (action: 'lower_price' | 'negotiable') => {
      if (action === 'lower_price') {
          const currentPrice = parseInt(formData.price) || 0;
          setFormData(prev => ({ ...prev, price: (currentPrice - 150).toString() }));
          toast({ title: "Price Updated", description: "Price lowered by 150 QAR." });
      }
      if (action === 'negotiable') {
          // In a real app, this would toggle a flag
          toast({ title: "Optimization Applied", description: "Marked as negotiable." });
          setDealAnalysis(prev => prev ? ({ ...prev, score: Math.min(prev.score + 5, 100) }) : null);
      }
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto py-6 px-4">
        {/* Progress Stepper */}
        {step < 7 && (
          <div className="mb-8">
             <div className="flex items-center justify-between mb-2">
                {STEPS.map((s, idx) => (
                  <div key={s.id} className={cn("flex flex-col items-center gap-1 transition-all duration-300", 
                    step === s.id ? "text-primary" : step > s.id ? "text-primary/60" : "text-muted-foreground/30"
                  )}>
                    <div className={cn("h-2 w-2 rounded-full transition-all", 
                       step === s.id ? "bg-primary w-8" : step > s.id ? "bg-primary" : "bg-muted"
                    )} />
                    <span className="text-[10px] font-medium uppercase tracking-wider hidden sm:block">{s.label}</span>
                  </div>
                ))}
             </div>
          </div>
        )}

        <Card className="border-0 shadow-2xl bg-card/80 backdrop-blur-md relative overflow-hidden min-h-[600px] flex flex-col">
          <AnimatePresence>
            {isAnalyzingImage && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-50 bg-background/95 backdrop-blur-xl flex flex-col items-center justify-center space-y-8"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-accent/20 rounded-full animate-ping" />
                  <div className="relative h-24 w-24 bg-gradient-to-tr from-primary to-accent rounded-full flex items-center justify-center shadow-lg text-white">
                    <Sparkles className="h-10 w-10 animate-pulse" />
                  </div>
                </div>
                
                <div className="space-y-2 text-center">
                  <motion.h3 
                    key={analysisStepIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-2xl font-display font-bold min-w-[300px]"
                  >
                    {AI_ANALYSIS_STEPS[analysisStepIndex]}
                  </motion.h3>
                  <p className="text-muted-foreground text-sm">Hold tight, AI is working its magic.</p>
                </div>

                <div className="flex gap-1">
                   {AI_ANALYSIS_STEPS.map((_, idx) => (
                     <div 
                       key={idx} 
                       className={`h-1.5 w-8 rounded-full transition-colors duration-300 ${idx <= analysisStepIndex ? "bg-accent" : "bg-secondary"}`} 
                     />
                   ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <CardHeader className="px-8 pt-8 pb-0">
             {step === 1 && <WizardHeader title="Add Photos" description="Start by uploading a photo. We'll analyze it to auto-fill details." />}
             {step === 2 && <WizardHeader title="Item Details" description="We've auto-filled these based on your image." />}
             {step === 3 && <WizardHeader title="Condition & Location" description="Confirm the details we detected." />}
             {step === 4 && <WizardHeader title="AI Assistant" description="Let AI help you write the perfect description." icon={<Wand2 className="h-6 w-6 text-primary" />} />}
             {step === 5 && <WizardHeader title="Assign AI Agent" description="Customize how your AI agent handles inquiries." icon={<Bot className="h-6 w-6 text-primary" />} />}
             {step === 6 && <WizardHeader title="Deal Optimization" description="Adjust your listing to get the best Deal Score." />}
          </CardHeader>

          <CardContent className="p-8 flex-1">
            {step === 1 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                {formData.images.length === 0 ? (
                  <div 
                    onClick={handleImageUpload}
                    className="group border-2 border-dashed border-muted-foreground/25 rounded-2xl h-80 flex flex-col items-center justify-center text-center gap-6 bg-secondary/10 hover:bg-secondary/30 transition-all cursor-pointer hover:border-accent/50"
                  >
                    <div className="h-20 w-20 rounded-full bg-secondary/50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Upload className="h-8 w-8 text-muted-foreground group-hover:text-foreground" />
                    </div>
                    <div>
                      <p className="text-lg font-medium">Click to upload photos</p>
                      <p className="text-sm text-muted-foreground mt-1">or drag and drop here</p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                     <div className="aspect-square rounded-2xl overflow-hidden relative group shadow-md">
                       <img src={formData.images[0]} className="w-full h-full object-cover" />
                       <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                         <Button variant="destructive" size="sm" onClick={() => setFormData({...formData, images: []})}>Remove</Button>
                       </div>
                     </div>
                     <div className="aspect-square rounded-2xl border-2 border-dashed flex items-center justify-center text-muted-foreground hover:bg-secondary/50 cursor-pointer transition-colors">
                        <Upload className="h-8 w-8" />
                     </div>
                  </div>
                )}
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                  <div className="space-y-3">
                    <Label className="text-base font-medium">Title</Label>
                    <Input 
                      placeholder="e.g. iPhone 15 Pro Max" 
                      value={formData.title}
                      onChange={e => setFormData({...formData, title: e.target.value})}
                      className="h-12 text-base"
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <Label className="text-base font-medium">Category</Label>
                    <Popover open={categoryOpen} onOpenChange={setCategoryOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={categoryOpen}
                          className="w-full justify-between h-12 text-base font-normal bg-background"
                        >
                          {formData.category
                            ? formData.category
                            : "Search for a category..."}
                          <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                        <Command>
                          <CommandInput placeholder="Search category..." />
                          <CommandList>
                            <CommandEmpty>No category found.</CommandEmpty>
                            <CommandGroup>
                              {CATEGORIES.map((category) => (
                                <CommandItem
                                  key={category}
                                  value={category}
                                  onSelect={(currentValue) => {
                                    setFormData({...formData, category: currentValue === formData.category ? "" : currentValue})
                                    setCategoryOpen(false)
                                  }}
                                  className="text-base py-3"
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      formData.category === category ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  {category}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>
              </div>
            )}

            {step === 3 && (
               <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                   <div className="space-y-3">
                     <Label className="text-base font-medium">Condition</Label>
                     <Select onValueChange={v => setFormData({...formData, condition: v})} value={formData.condition}>
                       <SelectTrigger className="h-12 text-base">
                         <SelectValue placeholder="Select condition" />
                       </SelectTrigger>
                       <SelectContent>
                         <SelectItem value="New">New (Sealed)</SelectItem>
                         <SelectItem value="Like New">Like New (Open Box)</SelectItem>
                         <SelectItem value="Good">Good (Minor wear)</SelectItem>
                         <SelectItem value="Fair">Fair (Visible wear)</SelectItem>
                       </SelectContent>
                     </Select>
                   </div>

                   <div className="space-y-3">
                     <Label className="text-base font-medium">Location</Label>
                     <div className="flex gap-3">
                       <Select onValueChange={v => setFormData({...formData, location: v})} value={formData.location}>
                         <SelectTrigger className="h-12 text-base flex-1">
                           <SelectValue placeholder="Select neighborhood" />
                         </SelectTrigger>
                         <SelectContent>
                           {NEIGHBORHOODS.map(n => <SelectItem key={n} value={n}>{n}</SelectItem>)}
                         </SelectContent>
                       </Select>
                       <Button 
                         size="icon" 
                         variant="outline" 
                         className="h-12 w-12 shrink-0 border-primary text-primary hover:bg-primary/5"
                         onClick={handleLocateMe}
                         title="Locate Me"
                       >
                         <Crosshair className="h-5 w-5" />
                       </Button>
                     </div>
                     <p className="text-xs text-muted-foreground flex items-center gap-1.5 ml-1">
                       <MapPin className="h-3 w-3" /> 
                       Tap the target button to auto-locate via GPS.
                     </p>
                   </div>
               </div>
            )}

            {step === 4 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                {!formData.description ? (
                  <div className="text-center py-12 space-y-6 border rounded-2xl bg-secondary/10 mt-4">
                    <Button 
                      size="lg" 
                      onClick={handleAIAutoFill} 
                      disabled={isGenerating}
                      className="bg-gradient-to-r from-primary to-primary/80 h-14 px-8 text-lg rounded-full shadow-lg hover:shadow-primary/20 hover:scale-105 transition-all duration-300"
                    >
                      {isGenerating ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Sparkles className="h-5 w-5 mr-2" />}
                      Generate Details with AI
                    </Button>
                    <p className="text-sm text-muted-foreground">Uses listing title + category + image analysis</p>
                  </div>
                ) : (
                  <div className="space-y-8">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                         <Label className="text-base font-medium">Description</Label>
                         <AISuggestedChip />
                      </div>
                      <Textarea 
                        value={formData.description} 
                        onChange={e => setFormData({...formData, description: e.target.value})}
                        className="h-40 text-base leading-relaxed resize-none"
                      />
                      <div className="flex flex-wrap gap-2">
                         <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs rounded-full" onClick={() => modifyDescription('rewrite')}>
                            <RefreshCw className="h-3 w-3" /> Rewrite
                         </Button>
                         <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs rounded-full" onClick={() => modifyDescription('shorten')}>
                            <AlignLeft className="h-3 w-3" /> Make Shorter
                         </Button>
                         <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs rounded-full" onClick={() => modifyDescription('professional')}>
                            <Sparkles className="h-3 w-3" /> Make Professional
                         </Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6 pt-2">
                       <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <Label className="text-base font-medium">Price (QAR)</Label>
                            {aiSuggestedPrice && <AISuggestedChip />}
                          </div>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
                            <Input 
                              className="pl-10 h-12 text-lg font-bold text-primary" 
                              value={formData.price} 
                              onChange={e => setFormData({...formData, price: e.target.value})} 
                            />
                          </div>
                       </div>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <Label className="text-base font-medium">Original Price</Label>
                            {aiSuggestedOriginalPrice && <AISuggestedChip />}
                          </div>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
                            <Input 
                              className="pl-10 h-12 text-lg text-muted-foreground" 
                              value={formData.originalPrice} 
                              onChange={e => setFormData({...formData, originalPrice: e.target.value})} 
                            />
                          </div>
                       </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {step === 5 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                 <div className="border rounded-2xl p-6 bg-accent/5 space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-lg font-medium flex items-center gap-2">
                            <Bot className="h-5 w-5 text-primary" /> Enable AI Agent
                          </Label>
                          <p className="text-sm text-muted-foreground">Agent will respond to buyers instantly 24/7.</p>
                        </div>
                        <Switch checked={enableAiAgent} onCheckedChange={setEnableAiAgent} />
                    </div>
                    
                    {enableAiAgent && (
                      <div className="space-y-6 pt-6 border-t animate-in fade-in slide-in-from-top-2">
                         <div className="space-y-3">
                           <Label className="text-base font-medium">Minimum Offer to Accept (Auto-Negotiate)</Label>
                           <div className="relative max-w-xs">
                              <DollarSign className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                              <Input 
                                placeholder="e.g. 2800" 
                                className="pl-9 h-12 text-base" 
                                value={agentPrefs.minOffer}
                                onChange={e => setAgentPrefs({...agentPrefs, minOffer: e.target.value})}
                              />
                           </div>
                           <p className="text-xs text-muted-foreground">Agent will politely decline offers below this amount.</p>
                         </div>
                         
                         <div className="space-y-4 pt-2">
                            <div className="flex items-start space-x-3 p-3 rounded-xl hover:bg-background/50 transition-colors">
                              <Checkbox 
                                id="viewings" 
                                className="mt-1"
                                checked={agentPrefs.scheduleViewings}
                                onCheckedChange={(c) => setAgentPrefs({...agentPrefs, scheduleViewings: !!c})}
                              />
                              <div className="space-y-1 leading-none">
                                <Label htmlFor="viewings" className="font-medium cursor-pointer">Schedule Viewings Automatically</Label>
                                <p className="text-xs text-muted-foreground">Allow agent to propose times based on your calendar.</p>
                              </div>
                            </div>
                            <div className="flex items-start space-x-3 p-3 rounded-xl hover:bg-background/50 transition-colors">
                              <Checkbox 
                                id="autoreply" 
                                className="mt-1"
                                checked={agentPrefs.autoReply} 
                                onCheckedChange={(c) => setAgentPrefs({...agentPrefs, autoReply: !!c})}
                              />
                              <div className="space-y-1 leading-none">
                                <Label htmlFor="autoreply" className="font-medium cursor-pointer">Answer Availability Questions</Label>
                                <p className="text-xs text-muted-foreground">"Is this still available?" will be answered automatically.</p>
                              </div>
                            </div>
                         </div>
                      </div>
                    )}
                 </div>
              </div>
            )}

            {step === 6 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                 <div className="space-y-2">
                    <h2 className="text-3xl font-display font-bold">Deal Optimization</h2>
                    <p className="text-muted-foreground text-lg">Review your Deal Score before publishing.</p>
                 </div>

                 <div className="flex flex-col items-center py-6">
                    <div className="relative">
                      <svg className="w-40 h-40 transform -rotate-90">
                        <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-secondary" />
                        <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray={440} strokeDashoffset={440 - (440 * (dealAnalysis?.score || 0)) / 100} className={`text-primary transition-all duration-1000 ease-out ${!dealAnalysis && "opacity-0"}`} />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center flex-col">
                         <span className="text-4xl font-bold">{dealAnalysis?.score}</span>
                         <span className="text-xs font-bold uppercase text-muted-foreground">Score</span>
                      </div>
                    </div>
                 </div>

                 <div className="space-y-4">
                    <h3 className="font-semibold flex items-center gap-2 text-lg">
                      <Sparkles className="h-5 w-5 text-primary" /> Optimization Suggestions
                    </h3>
                    <div className="grid gap-3">
                       <div 
                         className="p-4 rounded-xl border bg-card flex items-center justify-between hover:bg-accent/5 cursor-pointer transition-colors group relative overflow-hidden"
                         onClick={() => applyOptimization('lower_price')}
                       >
                          <div className="flex items-center gap-4 z-10">
                            <div className="h-10 w-10 rounded-full bg-green-100 text-green-700 flex items-center justify-center shrink-0">
                              <TrendingDown className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="font-medium">Lower price by QAR 150</p>
                              <p className="text-muted-foreground text-xs mt-0.5">Increases score to 92 (Excellent Deal)</p>
                            </div>
                          </div>
                          <Button size="sm" variant="outline" className="opacity-0 group-hover:opacity-100 transition-opacity z-10">Apply</Button>
                       </div>
                       
                       <div 
                         className="p-4 rounded-xl border bg-card flex items-center justify-between hover:bg-accent/5 cursor-pointer transition-colors group relative overflow-hidden"
                         onClick={() => applyOptimization('negotiable')}
                       >
                          <div className="flex items-center gap-4 z-10">
                            <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                              <Users className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="font-medium">Add "Negotiable" tag</p>
                              <p className="text-muted-foreground text-xs mt-0.5">Attracts 40% more buyers</p>
                            </div>
                          </div>
                          <Button size="sm" variant="outline" className="opacity-0 group-hover:opacity-100 transition-opacity z-10">Apply</Button>
                       </div>
                    </div>
                 </div>
                 
                 <div className="pt-6 border-t">
                    <Label className="mb-3 block font-medium">Quick Edit Price</Label>
                    <div className="relative">
                       <DollarSign className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
                       <Input 
                         value={formData.price} 
                         onChange={(e) => setFormData({...formData, price: e.target.value})}
                         className="pl-10 font-bold h-12 text-lg"
                       />
                    </div>
                 </div>
              </div>
            )}
            
            {step === 7 && (
               <div className="space-y-10 text-center py-12 animate-in fade-in zoom-in-95 duration-700">
                  <div className="mx-auto h-28 w-28 bg-primary/10 rounded-full flex items-center justify-center mb-6 animate-in fade-in zoom-in duration-500 delay-150">
                    <Check className="h-14 w-14 text-primary" />
                  </div>
                  
                  <div className="space-y-4 max-w-md mx-auto">
                     <h2 className="text-4xl font-display font-bold leading-tight">
                       Listed Successfully!
                     </h2>
                     <p className="text-lg text-muted-foreground leading-relaxed">
                       Don't worry, we'll sell this ASAP. We've already notified <span className="font-bold text-foreground">14 interested buyers</span> looking for {formData.category}.
                     </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto pt-8">
                     <Button variant="outline" size="lg" className="w-full h-12" asChild>
                       <Link href="/">Back Home</Link>
                     </Button>
                     <Button size="lg" className="w-full h-12 gap-2" asChild>
                       <Link href="/profile">
                         View Listing <ArrowRight className="h-4 w-4" />
                       </Link>
                     </Button>
                  </div>
               </div>
            )}

            <div className="flex justify-between mt-auto pt-8 border-t">
              {step > 1 && step < 6 ? (
                <Button variant="ghost" onClick={() => setStep(s => s - 1)} className="text-base font-medium text-muted-foreground hover:text-foreground">
                  <ChevronLeft className="mr-2 h-4 w-4" /> Back
                </Button>
              ) : (
                <div />
              )}
              
              <Button 
                onClick={handleNext} 
                disabled={step === 1 && formData.images.length === 0}
                className={`text-base font-medium h-12 px-8 rounded-full shadow-lg transition-all ${step === 6 ? "min-w-[200px]" : ""}`}
                size={step === 6 ? "lg" : "default"}
              >
                {step === 1 && formData.images.length > 0 ? "Analyze & Continue" : step === 5 ? "Calculate Score" : step === 6 ? "Publish Now" : "Next Step"}
                {step < 5 && <ChevronRight className="ml-2 h-5 w-5" />}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

function WizardHeader({ title, description, icon }: { title: string, description: string, icon?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between mb-2">
      <div className="space-y-1.5">
        <h2 className="text-2xl font-display font-bold">{title}</h2>
        <p className="text-muted-foreground text-base">{description}</p>
      </div>
      {icon}
    </div>
  );
}

function AISuggestedChip() {
  return (
    <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 gap-1.5 font-medium px-2.5 py-1">
      <Sparkles className="h-3.5 w-3.5 fill-current" />
      AI Suggested
    </Badge>
  );
}