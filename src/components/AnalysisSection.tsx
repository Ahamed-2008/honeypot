import { motion } from "framer-motion";
import { Shield, AlertTriangle, Link2, User, Copy, RefreshCw, MessageSquare } from "lucide-react";
import { AnimatedSection } from "@/components/AnimatedSection";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

function AnimatedCounter({ target, duration = 1500 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * target));
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [target, duration]);

  return <span>{count}</span>;
}

function RiskBar({ value, label }: { value: number; label: string }) {
  const getColor = () => {
    if (value >= 70) return "bg-destructive";
    if (value >= 40) return "bg-warning";
    return "bg-success";
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{value}%</span>
      </div>
      <div className="h-2 bg-secondary rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${value}%` }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className={`h-full ${getColor()} rounded-full`}
        />
      </div>
    </div>
  );
}

export function AnalysisSection() {
  return (
    <section id="analysis" className="py-24 lg:py-32 bg-secondary/30">
      <div className="section-container">
        <AnimatedSection className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            Analysis Dashboard
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Comprehensive threat analysis with AI-generated persona responses.
          </p>
        </AnimatedSection>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Risk Score Card */}
          <AnimatedSection delay={0.1} className="lg:col-span-2">
            <div className="card-elevated card-hover p-6 h-full">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-accent" />
                </div>
                <h3 className="text-lg font-semibold">Threat Analysis</h3>
              </div>

              <div className="grid sm:grid-cols-3 gap-6 mb-8">
                <div className="text-center p-4 rounded-xl bg-secondary/50">
                  <div className="text-3xl font-bold text-destructive">
                    <AnimatedCounter target={78} />%
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Risk Score</p>
                </div>
                <div className="text-center p-4 rounded-xl bg-secondary/50">
                  <div className="text-3xl font-bold text-warning">
                    <AnimatedCounter target={5} />
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Indicators</p>
                </div>
                <div className="text-center p-4 rounded-xl bg-secondary/50">
                  <div className="text-3xl font-bold text-info">
                    <AnimatedCounter target={3} />
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">URLs Found</p>
                </div>
              </div>

              <div className="space-y-4">
                <RiskBar value={78} label="Overall Risk" />
                <RiskBar value={85} label="Urgency Language" />
                <RiskBar value={60} label="Link Reputation" />
              </div>
            </div>
          </AnimatedSection>

          {/* Indicators Card */}
          <AnimatedSection delay={0.2}>
            <div className="card-elevated card-hover p-6 h-full">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-warning" />
                </div>
                <h3 className="text-lg font-semibold">Indicators</h3>
              </div>

              <div className="space-y-3">
                {[
                  { text: "Urgency language detected", type: "high" },
                  { text: "Suspicious sender domain", type: "high" },
                  { text: "External link to unknown host", type: "medium" },
                  { text: "Request for credentials", type: "high" },
                  { text: "Spoofed display name", type: "medium" },
                ].map((indicator, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 * i }}
                    className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50"
                  >
                    <div className={`w-2 h-2 rounded-full ${indicator.type === "high" ? "bg-destructive" : "bg-warning"}`} />
                    <span className="text-sm">{indicator.text}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </AnimatedSection>

          {/* Persona Reply Card */}
          <AnimatedSection delay={0.3} className="lg:col-span-2">
            <div className="card-elevated card-hover p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                    <MessageSquare className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Generated Reply</h3>
                    <p className="text-sm text-muted-foreground">Using persona: John Davis, Sr. Developer</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-success/10 text-success text-sm">
                  <User className="h-3.5 w-3.5" />
                  Active Persona
                </div>
              </div>

              <div className="p-4 rounded-xl bg-gradient-to-br from-accent/5 to-primary/5 border border-accent/10">
                <p className="text-sm leading-relaxed">
                  Hi there,<br /><br />
                  Thank you for reaching out. I'll need to verify this request with our security team 
                  before proceeding. Could you please provide additional details about the urgency 
                  of this matter and confirm your identity through our official verification process?<br /><br />
                  Best regards,<br />
                  John Davis
                </p>
              </div>

              <div className="flex gap-3 mt-4">
                <Button variant="outline" size="sm" className="gap-2">
                  <Copy className="h-4 w-4" />
                  Copy
                </Button>
                <Button variant="outline" size="sm" className="gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Regenerate
                </Button>
                <Button variant="gradient" size="sm" className="ml-auto">
                  Send Reply
                </Button>
              </div>
            </div>
          </AnimatedSection>

          {/* URLs Card */}
          <AnimatedSection delay={0.4}>
            <div className="card-elevated card-hover p-6 h-full">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center">
                  <Link2 className="h-5 w-5 text-info" />
                </div>
                <h3 className="text-lg font-semibold">Extracted URLs</h3>
              </div>

              <div className="space-y-3">
                {[
                  { url: "login-verify.suspicious.com", risk: "High" },
                  { url: "docs.company.net/reset", risk: "Medium" },
                  { url: "secure-portal.phish.io", risk: "High" },
                ].map((link, i) => (
                  <div key={i} className="p-3 rounded-lg bg-secondary/50">
                    <div className="flex items-center justify-between mb-1">
                      <span className={`risk-badge ${link.risk === "High" ? "risk-high" : "risk-medium"}`}>
                        {link.risk}
                      </span>
                    </div>
                    <p className="text-sm font-mono text-muted-foreground truncate">{link.url}</p>
                  </div>
                ))}
              </div>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
