import { useState, useEffect } from "react";
import { useParams, Link, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Copy, RefreshCw, Send, Download, Share2,
  AlertTriangle, Link2, User, Clock, CheckCircle, ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { RiskBadge } from "@/components/shared/RiskBadge";
import { RiskScoreBar } from "@/components/shared/RiskScoreBar";
import { AnimatedCounter } from "@/components/shared/AnimatedCounter";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function AnalysisPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [result, setResult] = useState(location.state?.analysisResult || null);
  const [loading, setLoading] = useState(!location.state?.analysisResult);

  useEffect(() => {
    // If no state was passed, fetch from API using the ID
    if (!location.state?.analysisResult && id) {
      fetch(`http://localhost:8000/history/${id}`)
        .then((res) => {
          if (!res.ok) throw new Error("History entry not found");
          return res.json();
        })
        .then((data) => {
          // Transform history entry to match expected format
          const transformedResult = {
            id: data.id,
            subject: data.subject,
            sender: data.sender,
            timestamp: data.timestamp,
            risk_score: data.risk_score,
            classification: data.classification,
            email_text: data.email_text,
            ai_analysis: data.ai_analysis
          };
          setResult(transformedResult);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Failed to load analysis:", error);
          toast.error("Failed to load analysis data");
          navigate("/upload");
        });
    }
  }, [id, location.state, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-foreground-secondary">Loading analysis...</p>
      </div>
    );
  }

  if (!result) return null;

  // Map backend response to UI format
  const aiAnalysis = result.ai_analysis || {};
  const phishingAnalysis = aiAnalysis.phishing_analysis || {};
  const generatedReply = aiAnalysis.generated_reply || {};
  const persona = aiAnalysis.persona || {};

  const analysisData = {
    id: result.id,
    subject: result.subject || "No Subject",
    sender: result.sender || "Unknown Sender",
    timestamp: result.timestamp || new Date().toLocaleString(),
    riskScore: phishingAnalysis.risk_score || 0,
    riskLevel: (phishingAnalysis.risk_score >= 70 ? "high" : phishingAnalysis.risk_score >= 40 ? "medium" : "low") as "high" | "medium" | "low",
    body: result.email_text || "This is an old history entry. The email content was not saved. Please analyze new emails to see full details.",
    indicators: (phishingAnalysis.tags || []).map((tag: string) => ({
      type: "threat",
      text: tag.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
      severity: "high"
    })),
    urls: (phishingAnalysis.urls || []).map((url: any) => ({
      url: url.url,
      threat: url.is_suspicious ? "high" : "low"
    })),
    tactics: phishingAnalysis.tactics || [],
  };

  const personaReply = {
    persona: persona.persona || "Default Persona",
    role: "Employee", // Backend doesn't provide role yet
    confidence: Math.round((persona.confidence || 1.0) * 100),
    tone: "Professional", // Backend doesn't provide tone yet
    reply: generatedReply.reply_body || "No reply generated.",
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    await new Promise((r) => setTimeout(r, 1500));
    setIsRegenerating(false);
    toast.success("Reply regenerated");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-6">
          {/* Back Navigation */}
          <div className="mb-8 animate-fade-in-up">
            <Link
              to="/history"
              className="inline-flex items-center text-foreground-secondary hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to History
            </Link>
          </div>

          {/* Header */}
          <div className="mb-8 animate-fade-in-up stagger-1">
            <div className="flex flex-wrap items-center gap-4 mb-4">
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                Email Analysis
              </h1>
              <RiskBadge level={analysisData.riskLevel} />
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-foreground-secondary">
              <span className="flex items-center gap-1">
                <User className="w-4 h-4" />
                {analysisData.sender}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {analysisData.timestamp}
              </span>
            </div>
          </div>

          <div className="grid lg:grid-cols-5 gap-8">
            {/* Left Column - Analysis */}
            <div className="lg:col-span-3 space-y-6">
              {/* Risk Score */}
              <Card className="animate-fade-in-up stagger-2">
                <CardHeader>
                  <CardTitle className="text-lg">Threat Assessment</CardTitle>
                </CardHeader>
                <CardContent>
                  <RiskScoreBar score={analysisData.riskScore} />
                </CardContent>
              </Card>

              {/* Phishing Indicators */}
              <Card className="animate-fade-in-up stagger-3">
                <CardHeader>
                  <CardTitle className="text-lg">Detected Indicators</CardTitle>
                  <CardDescription>
                    <AnimatedCounter end={analysisData.indicators.length} /> suspicious patterns found
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analysisData.indicators.map((indicator, index) => (
                      <div
                        key={index}
                        className={cn(
                          "flex items-start gap-3 p-3 rounded-lg border animate-fade-in-up",
                          indicator.severity === "high"
                            ? "bg-accent-danger/5 border-accent-danger/20"
                            : "bg-accent-warning/5 border-accent-warning/20"
                        )}
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <AlertTriangle className={cn(
                          "w-5 h-5 mt-0.5",
                          indicator.severity === "high" ? "text-accent-danger" : "text-accent-warning"
                        )} />
                        <span className="text-sm text-foreground">{indicator.text}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Email Content */}
              <Card className="animate-fade-in-up stagger-4">
                <CardHeader>
                  <CardTitle className="text-lg">Original Email</CardTitle>
                  <CardDescription>Subject: {analysisData.subject}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-background rounded-lg p-4 border border-border">
                    <pre className="text-sm text-foreground-secondary whitespace-pre-wrap font-sans">
                      {analysisData.body}
                    </pre>
                  </div>
                </CardContent>
              </Card>

              {/* Extracted URLs */}
              <Card className="animate-fade-in-up stagger-5">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Link2 className="w-5 h-5 text-accent-cyan" />
                    Extracted URLs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analysisData.urls.map((urlItem, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 rounded-lg bg-accent-danger/5 border border-accent-danger/20"
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          <ExternalLink className="w-4 h-4 text-accent-danger flex-shrink-0" />
                          <span className="text-sm text-foreground truncate">{urlItem.url}</span>
                        </div>
                        <Badge variant="destructive">High Threat</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Tactics */}
              <Card className="animate-fade-in-up">
                <CardHeader>
                  <CardTitle className="text-lg">Attacker Tactics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {analysisData.tactics.map((tactic, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="animate-fade-in-up"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        {tactic}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Persona Reply */}
            <div className="lg:col-span-2">
              <div className="lg:sticky lg:top-24 space-y-6">
                <Card className="animate-slide-in-right">
                  <CardHeader>
                    <CardTitle className="text-lg">Generated Persona Reply</CardTitle>
                    <CardDescription>
                      <Badge variant="secondary" className="mr-2">{personaReply.persona}</Badge>
                      <span className="text-foreground-tertiary">{personaReply.role}</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Confidence & Tone */}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-foreground-secondary">Confidence</span>
                      <span className="text-accent-cyan font-medium">{personaReply.confidence}%</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-foreground-secondary">Tone</span>
                      <Badge variant="info">{personaReply.tone}</Badge>
                    </div>

                    {/* Reply Bubble */}
                    <div className="relative">
                      <div className="bg-gradient-primary p-4 rounded-xl rounded-tr-sm text-primary-foreground">
                        <pre className="text-sm whitespace-pre-wrap font-sans">
                          {personaReply.reply}
                        </pre>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleCopy(personaReply.reply, "Reply")}
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copy
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={handleRegenerate}
                        disabled={isRegenerating}
                      >
                        <RefreshCw className={cn("w-4 h-4 mr-2", isRegenerating && "animate-spin")} />
                        Regenerate
                      </Button>
                      <Button variant="outline" size="sm" className="col-span-2">
                        <Send className="w-4 h-4 mr-2" />
                        Send to Attacker
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Export Options */}
                <Card className="animate-slide-in-right" style={{ animationDelay: "100ms" }}>
                  <CardHeader>
                    <CardTitle className="text-lg">Export & Share</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button variant="secondary" className="w-full justify-start">
                      <Download className="w-4 h-4 mr-2" />
                      Export as PDF
                    </Button>
                    <Button variant="secondary" className="w-full justify-start">
                      <Share2 className="w-4 h-4 mr-2" />
                      Share Analysis
                    </Button>
                    <Button variant="secondary" className="w-full justify-start">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Save to History
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
