import { cn } from "@/lib/utils";

interface DealScoreBadgeProps {
  score: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function DealScoreBadge({ score, size = "md", className }: DealScoreBadgeProps) {
  let colorClass = "bg-red-100 text-red-700 border-red-200";
  if (score >= 90) colorClass = "bg-accent/15 text-accent-foreground border-accent/30"; // Gold tier
  else if (score >= 80) colorClass = "bg-emerald-100 text-emerald-800 border-emerald-200";
  else if (score >= 70) colorClass = "bg-blue-100 text-blue-700 border-blue-200";
  else if (score >= 50) colorClass = "bg-yellow-100 text-yellow-800 border-yellow-200";

  const sizeClasses = {
    sm: "text-xs px-1.5 py-0.5",
    md: "text-sm px-2.5 py-1",
    lg: "text-base px-3 py-1.5 font-bold",
  };

  return (
    <div className={cn(
      "inline-flex items-center justify-center rounded-full border font-display tracking-tight transition-all",
      colorClass,
      sizeClasses[size],
      className
    )}>
      <span className="mr-1 opacity-70">Score</span>
      <span>{score}</span>
    </div>
  );
}

interface RiskBadgeProps {
  score: number; // 0-100, where 0 is no risk, 100 is high risk
  className?: string;
}

export function RiskBadge({ score, className }: RiskBadgeProps) {
  if (score < 10) return null; // Don't show if very safe

  let colorClass = "bg-gray-100 text-gray-600 border-gray-200";
  if (score > 50) colorClass = "bg-destructive/10 text-destructive border-destructive/20";
  else if (score > 20) colorClass = "bg-orange-100 text-orange-700 border-orange-200";

  return (
    <div className={cn(
      "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium",
      colorClass,
      className
    )}>
      <span>⚠️ Risk: {score > 50 ? "High" : "Moderate"}</span>
    </div>
  );
}
