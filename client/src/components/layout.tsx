import { Link, useLocation } from "wouter";
import { useStore } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Home, PlusCircle, MessageSquare, User, Bell, Menu, Settings, ListFilter, LogOut, Zap } from "lucide-react";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const { userType, currentUser, logout } = useStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location === path;

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 md:gap-8">
            <Link href="/">
              <a className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-white font-display font-bold text-xl">
                  U
                </div>
                <span className="font-display font-bold text-xl hidden sm:inline-block tracking-tight text-primary">
                  Undr
                </span>
              </a>
            </Link>
            
            <div className="hidden md:flex relative max-w-md w-[300px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search deals..." 
                className="pl-9 bg-secondary/50 border-transparent focus:bg-background focus:border-input transition-all rounded-full h-9" 
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/sell/new">
              <Button size="sm" className="hidden md:flex gap-1.5 rounded-full font-medium">
                <PlusCircle className="h-4 w-4" />
                Sell Item
              </Button>
            </Link>

            <div className="flex items-center gap-1">
              {currentUser && (
                <Link href="/inbox">
                  <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground hidden sm:flex">
                    <MessageSquare className="h-5 w-5" />
                    <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-destructive border-2 border-background" />
                  </Button>
                </Link>
              )}
              
              {currentUser ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative rounded-full h-9 w-9 border border-accent/20 bg-accent/5 hover:bg-accent/10 transition-colors ml-1">
                      <Avatar className="h-8 w-8 border border-background">
                         <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.name}`} />
                         <AvatarFallback>{currentUser.name.substring(0,2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      {userType === 'premium' && (
                        <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-accent border-2 border-background flex items-center justify-center text-[8px] font-bold text-accent-foreground shadow-sm">
                          <Zap className="h-2 w-2 fill-current" />
                        </div>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 p-2 rounded-xl shadow-xl border-border/50 bg-background/95 backdrop-blur-lg">
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{currentUser.name}</p>
                        <p className="text-xs leading-none text-muted-foreground">{currentUser.phone}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/feed" className="flex items-center gap-2 cursor-pointer rounded-lg">
                        <Zap className="h-4 w-4 text-accent" />
                        <span>My Feed & Alerts</span>
                        <Badge variant="secondary" className="ml-auto text-[10px] h-5 px-1.5">3 New</Badge>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                       <Link href="/inbox" className="flex items-center gap-2 cursor-pointer rounded-lg">
                         <MessageSquare className="h-4 w-4" />
                         Inbox
                       </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="flex items-center gap-2 cursor-pointer rounded-lg">
                      <Settings className="h-4 w-4" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="flex items-center gap-2 cursor-pointer rounded-lg text-destructive focus:text-destructive"
                      onClick={() => {
                        logout();
                        setLocation("/auth");
                      }}
                    >
                      <LogOut className="h-4 w-4" />
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link href="/auth">
                   <Button variant="default" size="sm" className="ml-2 gap-2 font-semibold">
                      Sign In
                   </Button>
                </Link>
              )}
            </div>
            
            {/* Mobile Menu */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <div className="flex flex-col gap-6 mt-6">
                  {currentUser ? (
                    <div className="flex items-center gap-3 px-2 pb-4 border-b">
                       <Avatar>
                           <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.name}`} />
                           <AvatarFallback>{currentUser.name.substring(0,2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{currentUser.name}</p>
                          <p className="text-xs text-muted-foreground">{userType === 'premium' ? 'Premium Member' : 'Free Account'}</p>
                        </div>
                    </div>
                  ) : (
                    <div className="px-2 pb-4 border-b">
                      <Link href="/auth" onClick={() => setIsMobileMenuOpen(false)}>
                        <Button className="w-full">Sign In / Sign Up</Button>
                      </Link>
                    </div>
                  )}

                  {currentUser && (
                    <>
                      <Link href="/feed" onClick={() => setIsMobileMenuOpen(false)}>
                        <Button className="w-full justify-start gap-2 bg-accent/10 text-accent-foreground hover:bg-accent/20 border-accent/20" variant="outline" size="lg">
                          <Zap className="h-5 w-5" />
                          My Hot Deals
                        </Button>
                      </Link>
                      <Link href="/sell/new" onClick={() => setIsMobileMenuOpen(false)}>
                        <Button className="w-full justify-start gap-2" size="lg">
                          <PlusCircle className="h-5 w-5" />
                          Post a Deal
                        </Button>
                      </Link>
                    </>
                  )}
                  
                  <div className="space-y-2">
                    <h4 className="font-medium text-muted-foreground text-sm px-2">Browse</h4>
                    <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start gap-2">
                        <Home className="h-5 w-5" />
                        Top Deals
                      </Button>
                    </Link>
                  </div>
                  
                  {currentUser && (
                     <div className="space-y-2">
                      <h4 className="font-medium text-muted-foreground text-sm px-2">Account</h4>
                      <Link href="/inbox" onClick={() => setIsMobileMenuOpen(false)}>
                        <Button variant="ghost" className="w-full justify-start gap-2">
                          <MessageSquare className="h-5 w-5" />
                          Inbox
                        </Button>
                      </Link>
                      <Button variant="ghost" className="w-full justify-start gap-2">
                        <Settings className="h-5 w-5" />
                        Settings
                      </Button>
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start gap-2 text-destructive"
                        onClick={() => {
                          logout();
                          setIsMobileMenuOpen(false);
                          setLocation("/auth");
                        }}
                      >
                        <LogOut className="h-5 w-5" />
                        Sign Out
                      </Button>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 md:py-8 min-h-[calc(100vh-4rem)]">
        {children}
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t bg-background/90 backdrop-blur-lg pb-safe z-40">
        <div className="grid grid-cols-4 h-16">
          <Link href="/">
            <a className={`flex flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors ${isActive('/') ? 'text-primary' : 'text-muted-foreground'}`}>
              <Home className="h-5 w-5" />
              Home
            </a>
          </Link>
          <Link href="/feed">
             <a className={`flex flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors ${isActive('/feed') ? 'text-primary' : 'text-muted-foreground'}`}>
              <Zap className="h-5 w-5" />
              My Feed
            </a>
          </Link>
           <Link href="/sell/new">
             <a className={`flex flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors ${isActive('/sell/new') ? 'text-primary' : 'text-muted-foreground'}`}>
              <PlusCircle className="h-5 w-5" />
              Sell
            </a>
          </Link>
          <Link href={currentUser ? "/profile" : "/auth"}>
             <a className={`flex flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors ${isActive('/profile') ? 'text-primary' : 'text-muted-foreground'}`}>
              <User className="h-5 w-5" />
              {currentUser ? 'Account' : 'Login'}
            </a>
          </Link>
        </div>
      </nav>
    </div>
  );
}
