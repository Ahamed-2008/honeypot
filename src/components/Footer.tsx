import { Shield } from "lucide-react";
import { AnimatedSection } from "@/components/AnimatedSection";

export function Footer() {
  return (
    <footer className="py-12 border-t border-border">
      <div className="section-container">
        <AnimatedSection>
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <span className="font-semibold">
                Persona<span className="text-accent">Mimic</span>
              </span>
            </div>

            {/* Links */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">Documentation</a>
              <a href="#" className="hover:text-foreground transition-colors">API</a>
              <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
              <a href="#" className="hover:text-foreground transition-colors">Terms</a>
            </div>

            {/* Copyright */}
            <p className="text-sm text-muted-foreground">
              © 2024 PersonaMimic. All rights reserved.
            </p>
          </div>
        </AnimatedSection>
      </div>
    </footer>
  );
}
