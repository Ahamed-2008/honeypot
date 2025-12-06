import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "bg-background-tertiary rounded-lg animate-shimmer",
        className
      )}
    />
  );
}
