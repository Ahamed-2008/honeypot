import { Link } from "react-router-dom";
import { Shield, Mail, BarChart3, Users, ArrowRight, Zap, Lock, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const features = [
  {
    icon: Mail,
    title: "Email Analysis",
    description: "Upload suspicious emails and get instant phishing detection with detailed threat indicators.",
  },
  {
    icon: Users,
    title: "Virtual Personas",
    description: "AI-generated employee personas engage attackers with realistic responses.",
  },
  {
    icon: BarChart3,
    title: "Behavioral Intelligence",
    description: "Track attacker patterns, escalation tactics, and gather threat intelligence.",
  },
  {
    icon: Lock,
    title: "Secure Honeypot",
    description: "Safe environment to study social engineering attacks without risk.",
  },
];

const stats = [
  { value: "99.2%", label: "Detection Rate" },
  { value: "500+", label: "Personas Available" },
  { value: "<2s", label: "Analysis Time" },
  { value: "24/7", label: "Monitoring" },
];

export default function Index() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 pt-16">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-24 lg:py-32">
          {/* Animated gradient background */}
          <div className="absolute inset-0 bg-gradient-primary opacity-5 animate-gradient-shift" />
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent-cyan/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-purple/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "1.5s" }} />
          
          <div className="container mx-auto px-6 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-background-secondary border border-border mb-8 animate-fade-in-up">
                <Zap className="w-4 h-4 text-accent-cyan" />
                <span className="text-sm text-foreground-secondary">AI-Powered Security Analysis</span>
              </div>
              
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 animate-blur-in">
                <span className="text-foreground">Analyze. Engage.</span>
                <br />
                <span className="text-gradient">Protect.</span>
              </h1>
              
              <p className="text-lg md:text-xl text-foreground-secondary max-w-2xl mx-auto mb-10 animate-fade-in-up stagger-2">
                PersonaMimic creates realistic virtual employee personas to engage with social engineering attackers and gather behavioral intelligence.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up stagger-3">
                <Button asChild size="lg" className="min-w-[160px]">
                  <Link to="/upload">
                    Get Started
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="min-w-[160px]">
                  <Link to="/history">
                    View History
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 border-y border-border/50">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div 
                  key={stat.label} 
                  className="text-center animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="text-3xl md:text-4xl font-bold text-gradient mb-2">{stat.value}</div>
                  <div className="text-sm text-foreground-secondary">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 animate-blur-in">
                Powerful <span className="text-gradient">Features</span>
              </h2>
              <p className="text-foreground-secondary max-w-2xl mx-auto">
                Advanced tools to detect, analyze, and respond to social engineering threats.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <Card 
                  key={feature.title} 
                  className="group animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardContent className="pt-6">
                    <div className="w-12 h-12 rounded-lg bg-gradient-primary/10 flex items-center justify-center mb-4 group-hover:animate-pulse-glow transition-all duration-300">
                      <feature.icon className="w-6 h-6 text-accent-cyan" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2 text-foreground">{feature.title}</h3>
                    <p className="text-sm text-foreground-secondary">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-primary opacity-5" />
          <div className="container mx-auto px-6 relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-primary mx-auto mb-8 flex items-center justify-center animate-float">
                <Shield className="w-8 h-8 text-primary-foreground" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to enhance your security?
              </h2>
              <p className="text-foreground-secondary mb-8">
                Start analyzing suspicious emails and protect your organization from social engineering attacks.
              </p>
              <Button asChild size="lg">
                <Link to="/upload">
                  Analyze Your First Email
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
