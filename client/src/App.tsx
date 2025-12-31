import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import ListingDetails from "@/pages/listing-details";
import SellWizard from "@/pages/sell-wizard";
import Premium from "@/pages/premium";
import Inbox from "@/pages/inbox";
import MyFeed from "@/pages/my-feed";
import Profile from "@/pages/profile";
import AuthPage from "@/pages/auth";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/listing/:id" component={ListingDetails} />
      <Route path="/sell/new" component={SellWizard} />
      <Route path="/premium" component={Premium} />
      <Route path="/inbox" component={Inbox} />
      <Route path="/feed" component={MyFeed} />
      <Route path="/profile" component={Profile} />
      <Route path="/saved" component={MyFeed} />
      <Route path="/search" component={() => <Home />} /> 
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
