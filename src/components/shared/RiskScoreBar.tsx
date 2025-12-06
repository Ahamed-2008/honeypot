import { useEffect, useState, useRef } from "react";
import { useInView } from "@/hooks/useInView";
import { cn } from "@/lib/utils";

interface RiskScoreBarProps {
  score: number;
  className?: string;
}

export function RiskScoreBar({ score, className }: RiskScoreBarProps) {
  const [width, setWidth] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { threshold: 0.5 });
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (isInView && !hasAnimated.current) {
      hasAnimated.current = true;
      setTimeout(() => setWidth(score), 100);
    }
  }, [isInView, score]);

  const getColor = () => {
    if (score >= 70) return "from-accent-danger to-accent-warning";
    if (score >= 40) return "from-accent-warning to-accent-success";
    return "from-accent-success to-accent-cyan";
  };

  return (
    <div ref={ref} className={cn("w-full", className)}>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-foreground-secondary">Risk Score</span>
        <span className={cn(
          "text-lg font-bold",
          score >= 70 ? "text-accent-danger" : score >= 40 ? "text-accent-warning" : "text-accent-success"
        )}>
          {score}%
        </span>
      </div>
      <div className="h-2 bg-background-tertiary rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full bg-gradient-to-r rounded-full transition-all duration-[1.5s] ease-out",
            getColor(),
            score >= 70 && "animate-pulse-glow"
          )}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}
