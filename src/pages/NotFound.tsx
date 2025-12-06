import { Link } from "react-router-dom";
import { ArrowLeft, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center px-6">
        <div className="w-20 h-20 rounded-2xl bg-gradient-primary mx-auto mb-8 flex items-center justify-center animate-float">
          <Shield className="w-10 h-10 text-primary-foreground" />
        </div>
        <h1 className="text-6xl font-bold text-gradient mb-4 animate-blur-in">404</h1>
        <p className="text-xl text-foreground-secondary mb-8 animate-fade-in-up">
          Page not found
        </p>
        <Button asChild className="animate-fade-in-up stagger-2">
          <Link to="/">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Return Home
          </Link>
        </Button>
      </div>
    </div>
  );
}
