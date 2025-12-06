import { useState } from "react";
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

// Demo data
const historyData = [
  {
    id: "1",
    date: "2024-01-15 14:32",
    sender: "security@paypa1-support.com",
    subject: "Urgent: Your Account Has Been Compromised",
    riskLevel: "high" as const,
    indicatorsCount: 4,
  },
  {
    id: "2",
    date: "2024-01-14 09:15",
    sender: "hr@company-benefits.net",
    subject: "Action Required: Update Your Benefits Information",
    riskLevel: "medium" as const,
    indicatorsCount: 2,
  },
  {
    id: "3",
    date: "2024-01-13 16:45",
    sender: "admin@microsoft-support.org",
    subject: "Your Microsoft 365 License Expires Soon",
    riskLevel: "high" as const,
    indicatorsCount: 5,
  },
  {
    id: "4",
    date: "2024-01-12 11:20",
    sender: "newsletter@legitimate-company.com",
    subject: "Monthly Newsletter - January Edition",
    riskLevel: "low" as const,
    indicatorsCount: 0,
  },
  {
    id: "5",
    date: "2024-01-11 08:30",
    sender: "ceo@your-company-exec.com",
    subject: "Urgent Wire Transfer Needed",
    riskLevel: "high" as const,
    indicatorsCount: 6,
  },
];

const stats = [
  { label: "Total Analyzed", value: 127, color: "text-accent-cyan" },
  { label: "High Risk", value: 23, color: "text-accent-danger" },
  { label: "Avg Risk Score", value: 58, suffix: "%", color: "text-accent-warning" },
  { label: "Top Domain", value: "paypa1.com", isText: true },
];

export default function HistoryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredData = historyData.filter(
    (item) =>
      item.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sender.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = (id: string) => {
    toast.success("Analysis deleted");
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
