import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface RiskBadgeProps {
  level: "low" | "medium" | "high";
  className?: string;
}

export function RiskBadge({ level, className }: RiskBadgeProps) {
  const config = {
    low: { variant: "success" as const, label: "Low Risk" },
    medium: { variant: "warning" as const, label: "Medium Risk" },
    high: { variant: "destructive" as const, label: "High Risk" },
  };

  const { variant, label } = config[level];

  return (
    <Badge 
      variant={variant} 
      className={cn(
        level === "high" && "animate-pulse-glow",
        className
      )}
    >
      {label}
    </Badge>
  );
}
