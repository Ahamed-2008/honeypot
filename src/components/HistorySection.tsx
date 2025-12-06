import { motion } from "framer-motion";
import { Clock, Search, Filter, ChevronRight, Eye, Trash2, TrendingUp, AlertCircle, CheckCircle } from "lucide-react";
import { AnimatedSection } from "@/components/AnimatedSection";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

function AnimatedCounter({ target }: { target: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / 1500, 1);
      setCount(Math.floor(progress * target));
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [target]);

  return <span>{count}</span>;
}

const historyItems = [
  {
    id: 1,
    date: "Dec 5, 2024",
    time: "2:34 PM",
    sender: "urgent@support-update.com",
    subject: "Immediate Action Required: Account Verification",
    risk: "high" as const,
    indicators: 5,
  },
  {
    id: 2,
    date: "Dec 4, 2024",
    time: "11:20 AM",
    sender: "hr.department@companyx.net",
    subject: "Updated Employee Benefits - Please Review",
    risk: "medium" as const,
    indicators: 3,
  },
  {
    id: 3,
    date: "Dec 3, 2024",
    time: "4:15 PM",
    sender: "newsletter@trusted-source.com",
    subject: "Weekly Security Digest",
    risk: "low" as const,
    indicators: 1,
  },
];

export function HistorySection() {
  return (
    <section id="history" className="py-24 lg:py-32">
      <div className="section-container">
        <AnimatedSection className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            Analysis History
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Track and review all your previous email analyses and threat assessments.
          </p>
        </AnimatedSection>

        {/* Statistics */}
        <AnimatedSection delay={0.1}>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Total Analyzed", value: 247, icon: TrendingUp, color: "text-accent" },
              { label: "High Risk", value: 43, icon: AlertCircle, color: "text-destructive" },
              { label: "Medium Risk", value: 89, icon: AlertCircle, color: "text-warning" },
              { label: "Safe Emails", value: 115, icon: CheckCircle, color: "text-success" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 * i }}
                className="card-elevated card-hover p-5 text-center"
              >
                <stat.icon className={`h-5 w-5 mx-auto mb-2 ${stat.color}`} />
                <div className="text-2xl font-bold">
                  <AnimatedCounter target={stat.value} />
                </div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </AnimatedSection>

        {/* Search & Filter */}
        <AnimatedSection delay={0.2}>
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by sender or subject..."
                className="w-full h-11 pl-10 pr-4 rounded-lg bg-card border border-border focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all outline-none"
              />
            </div>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
          </div>
        </AnimatedSection>

        {/* History List */}
        <AnimatedSection delay={0.3}>
          <div className="card-elevated overflow-hidden">
            <div className="divide-y divide-border">
              {historyItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.05 * index }}
                  className="p-4 hover:bg-secondary/50 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-4">
                    {/* Date/Time */}
                    <div className="hidden sm:block text-center min-w-[80px]">
                      <p className="text-sm font-medium">{item.date}</p>
                      <p className="text-xs text-muted-foreground">{item.time}</p>
                    </div>

                    {/* Risk Badge */}
                    <div className={`risk-badge ${
                      item.risk === "high" ? "risk-high" :
                      item.risk === "medium" ? "risk-medium" : "risk-low"
                    }`}>
                      {item.risk === "high" ? "High" :
                       item.risk === "medium" ? "Medium" : "Low"}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{item.subject}</p>
                      <p className="text-sm text-muted-foreground truncate">{item.sender}</p>
                    </div>

                    {/* Indicators */}
                    <div className="hidden md:flex items-center gap-1 text-sm text-muted-foreground">
                      <AlertCircle className="h-4 w-4" />
                      {item.indicators}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 hover:bg-secondary rounded-lg transition-colors">
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      </button>
                      <button className="p-2 hover:bg-destructive/10 rounded-lg transition-colors">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </button>
                    </div>

                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </AnimatedSection>

        {/* View More */}
        <div className="text-center mt-8">
          <Button variant="outline" className="gap-2">
            View Full History
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}
