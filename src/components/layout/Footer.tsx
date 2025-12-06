import { Shield } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/50 py-8 mt-auto">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-foreground-secondary">
            <Shield className="w-4 h-4 text-accent-cyan" />
            <span className="text-sm">PersonaMimic</span>
          </div>
          <p className="text-sm text-foreground-tertiary">
            AI-Powered Social Engineering Analysis
          </p>
        </div>
      </div>
    </footer>
  );
}
