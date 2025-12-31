import { Link } from "wouter";
import { Listing } from "@/lib/mockData";
import { DealScoreBadge, RiskBadge } from "./deal-score-badge";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, Lock } from "lucide-react";
import { formatDistanceToNow, addHours, format } from "date-fns";

interface DealCardProps {
  listing: Listing;
}

export function DealCard({ listing }: DealCardProps) {
  const discountPercentage = Math.round(((listing.originalPrice - listing.price) / listing.originalPrice) * 100);

  // Mock unlock time for premium deals
  const unlockTime = addHours(new Date(), 2);

  return (
    <Link href={`/listing/${listing.id}`}>
      <Card className="group overflow-hidden border-border/50 transition-all hover:shadow-lg hover:border-accent/50 cursor-pointer h-full flex flex-col bg-card">
        <div className="relative aspect-[4/3] overflow-hidden bg-secondary/50">
          <img
            src={listing.images[0]}
            alt={listing.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute top-2 left-2 flex flex-col gap-2 items-start">
             {listing.isPremiumEarlyAccess && (
              <Badge className="bg-primary/90 hover:bg-primary backdrop-blur-sm text-white border-0 shadow-sm gap-1 pl-1.5">
                <Lock className="h-3 w-3" />
                <span>Public in {format(unlockTime, "h'h' m'm'")}</span>
              </Badge>
            )}
             <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm shadow-sm font-medium">
               {listing.category}
             </Badge>
          </div>
          <div className="absolute bottom-2 right-2">
            <DealScoreBadge score={listing.dealScore} size="sm" className="bg-background/90 backdrop-blur-sm shadow-sm" />
          </div>
        </div>

        <CardContent className="p-4 flex-1 flex flex-col gap-2">
          <div className="flex justify-between items-start gap-2">
            <h3 className="font-display font-semibold text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors">
              {listing.title}
            </h3>
          </div>
          
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-bold text-primary">
              {listing.currency} {listing.price.toLocaleString()}
            </span>
            <span className="text-sm text-muted-foreground line-through decoration-destructive/50">
              {listing.originalPrice.toLocaleString()}
            </span>
            <span className="text-xs font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
              -{discountPercentage}%
            </span>
          </div>

          <div className="mt-auto pt-4 flex items-center justify-between text-xs text-muted-foreground">
             <div className="flex items-center gap-1">
               <MapPin className="h-3 w-3" />
               {listing.location}
             </div>
             <div className="flex items-center gap-1">
               <Clock className="h-3 w-3" />
               {formatDistanceToNow(new Date(listing.postedAt), { addSuffix: true })}
             </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
