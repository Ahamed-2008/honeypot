import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, Filter, Trash2, Eye, Users, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { RiskBadge } from "@/components/shared/RiskBadge";
import { AnimatedCounter } from "@/components/shared/AnimatedCounter";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface HistoryEntry {
  id: string;
  subject: string;
  sender: string;
  timestamp: string;
  risk_score: number;
  classification: string;
  ai_risk_score: number;
  is_phishing: boolean;
}

export default function HistoryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch history from backend
  useEffect(() => {
    fetch("http://localhost:8000/history")
      .then((res) => res.json())
      .then((data) => {
        const formatted = (data.history || []).map((item: HistoryEntry) => ({
          id: item.id,
          date: new Date(item.timestamp).toLocaleString(),
          sender: item.sender || "Unknown Sender",
          subject: item.subject || "No Subject",
          riskLevel: (item.ai_risk_score >= 70 ? "high" : item.ai_risk_score >= 40 ? "medium" : "low") as "high" | "medium" | "low",
          indicatorsCount: item.is_phishing ? 3 : 0,
        }));
        setHistoryData(formatted);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Failed to load history:", error);
        toast.error("Failed to load history");
        setLoading(false);
      });
  }, []);

  // Calculate stats from actual data
  const stats = [
    { label: "Total Analyzed", value: historyData.length, color: "text-accent-cyan" },
    { label: "High Risk", value: historyData.filter(item => item.riskLevel === "high").length, color: "text-accent-danger" },
    { label: "Avg Risk Score", value: historyData.length > 0 ? Math.round(historyData.reduce((acc, item) => acc + (item.riskLevel === "high" ? 80 : item.riskLevel === "medium" ? 50 : 20), 0) / historyData.length) : 0, suffix: "%", color: "text-accent-warning" },
    { label: "Recent Items", value: historyData.length, color: "text-accent-cyan" },
  ];

  const filteredData = historyData.filter(
    (item) =>
      item.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sender.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = (id: string) => {
    fetch(`http://localhost:8000/history/${id}`, {
      method: 'DELETE',
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to delete");
        return res.json();
      })
      .then(() => {
        // Remove the deleted entry from local state
        setHistoryData((prev) => prev.filter((item) => item.id !== id));
        toast.success("Analysis deleted");
      })
      .catch((error) => {
        console.error("Failed to delete:", error);
        toast.error("Failed to delete analysis");
      });
  };


  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-6">
          {/* Header */}
          <div className="mb-8 animate-blur-in">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              Analysis <span className="text-gradient">History</span>
            </h1>
            <p className="text-foreground-secondary">
              View and manage your previous email analyses
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((stat, index) => (
              <Card
                key={stat.label}
                className="animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="pt-6">
                  <div className={cn("text-3xl font-bold mb-1", stat.color)}>
                    {stat.isText ? (
                      stat.value
                    ) : (
                      <AnimatedCounter
                        end={stat.value as number}
                        suffix={stat.suffix}
                      />
                    )}
                  </div>
                  <div className="text-sm text-foreground-secondary">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Search & Filter Bar */}
          <Card className="mb-6 animate-fade-in-up stagger-4">
            <CardContent className="py-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-tertiary" />
                  <Input
                    placeholder="Search by subject or sender..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button variant="secondary">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* History Table */}
          <Card className="animate-fade-in-up stagger-5">
            <CardHeader>
              <CardTitle>Recent Analyses</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredData.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-foreground-secondary mb-4">No analyses found</p>
                  <Button asChild>
                    <Link to="/upload">Upload an Email</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredData.map((item, index) => (
                    <div
                      key={item.id}
                      className={cn(
                        "group flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 rounded-lg border border-transparent transition-all duration-300 animate-fade-in-up",
                        "hover:bg-background-tertiary hover:border-accent-cyan/20 hover:scale-[1.01]",
                        index % 2 === 0 ? "bg-background" : "bg-background-secondary/50"
                      )}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      {/* Left Section */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <RiskBadge level={item.riskLevel} />
                          <span className="text-xs text-foreground-tertiary">{item.date}</span>
                        </div>
                        <h3 className="font-medium text-foreground truncate mb-1 group-hover:text-accent-cyan transition-colors">
                          {item.subject}
                        </h3>
                        <p className="text-sm text-foreground-secondary truncate">
                          From: {item.sender}
                        </p>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-6 text-sm">
                        <div className="flex items-center gap-2 text-foreground-secondary">
                          <span>{item.indicatorsCount} indicators</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button asChild variant="ghost" size="sm">
                          <Link to={`/analysis/${item.id}`}>
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Link>
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Users className="w-4 h-4 mr-1" />
                          Personas
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(item.id)}
                          className="text-accent-danger hover:text-accent-danger hover:bg-accent-danger/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {filteredData.length > 0 && (
                <div className="flex items-center justify-center gap-4 mt-6 pt-6 border-t border-border">
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => p - 1)}
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Previous
                  </Button>
                  <span className="text-sm text-foreground-secondary">
                    Page <span className="text-accent-cyan">{currentPage}</span> of 1
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => p + 1)}
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
