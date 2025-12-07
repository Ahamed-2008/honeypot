import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Upload as UploadIcon, Mail, FileText, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function UploadPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    subject: "",
    body: "",
    senderEmail: "",
    notes: "",
  });

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleFile = (file: File) => {
    const validTypes = [".txt", ".eml", ".html"];
    const ext = "." + file.name.split(".").pop()?.toLowerCase();
    if (!validTypes.includes(ext)) {
      toast.error("Invalid file type. Please upload .txt, .eml, or .html files.");
      return;
    }
    setFileName(file.name);
    setSelectedFile(file);
    toast.success(`File "${file.name}" uploaded successfully`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile && !formData.body.trim()) {
      toast.error("Please provide an email file or body text");
      return;
    }

    setIsLoading(true);

    try {
      const data = new FormData();
      if (selectedFile) {
        data.append("file", selectedFile);
      } else {
        data.append("raw_text", formData.body);
        // Note: Backend currently extracts subject/sender from raw text or defaults them.
        // Future improvement: Update backend to accept subject/sender params.
      }

      const response = await fetch("http://localhost:8001/ingest-email", {
        method: "POST",
        body: data,
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const result = await response.json();
      toast.success("Analysis complete!");

      // Navigate to analysis page with the result data
      navigate(`/analysis/${result.id}`, { state: { analysisResult: result } });

    } catch (error) {
      console.error("Analysis failed:", error);
      toast.error("Analysis failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const clearForm = () => {
    setFormData({ subject: "", body: "", senderEmail: "", notes: "" });
    setFileName(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 pt-24 pb-16">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-12">
          <div className="absolute top-0 left-1/3 w-72 h-72 bg-accent-cyan/5 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-0 right-1/3 w-72 h-72 bg-accent-purple/5 rounded-full blur-3xl animate-float" style={{ animationDelay: "1s" }} />

          <div className="container mx-auto px-6 relative z-10">
            <div className="max-w-2xl mx-auto text-center mb-12">
              <div className="w-16 h-16 rounded-2xl bg-gradient-primary/10 mx-auto mb-6 flex items-center justify-center animate-float">
                <Mail className="w-8 h-8 text-accent-cyan" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-4 animate-blur-in">
                Analyze Email <span className="text-gradient">Security</span>
              </h1>
              <p className="text-foreground-secondary animate-fade-in-up stagger-1">
                Upload an email to detect phishing tactics and attacker behavior
              </p>
            </div>

            {/* Upload Card */}
            <Card className="max-w-2xl mx-auto animate-fade-in-up stagger-2">
              <CardHeader>
                <CardTitle>Upload Email</CardTitle>
                <CardDescription>
                  Drag and drop a file or enter the email content manually
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Drag & Drop Zone */}
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={cn(
                      "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300",
                      isDragging
                        ? "border-accent-cyan bg-accent-cyan/5 glow-cyan"
                        : "border-border hover:border-accent-cyan/50 hover:bg-background-tertiary/50"
                    )}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".txt,.eml,.html"
                      className="hidden"
                      onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                    />

                    {fileName ? (
                      <div className="flex items-center justify-center gap-3">
                        <FileText className="w-8 h-8 text-accent-cyan" />
                        <span className="text-foreground">{fileName}</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setFileName(null);
                          }}
                          className="p-1 hover:bg-background-tertiary rounded-full transition-colors"
                        >
                          <X className="w-4 h-4 text-foreground-secondary" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <UploadIcon className={cn(
                          "w-12 h-12 mx-auto mb-4 transition-all duration-300",
                          isDragging ? "text-accent-cyan scale-110" : "text-foreground-tertiary"
                        )} />
                        <p className="text-foreground-secondary mb-2">
                          Drop your email here or click to browse
                        </p>
                        <p className="text-sm text-foreground-tertiary">
                          Accepted formats: .txt, .eml, .html
                        </p>
                      </>
                    )}
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-foreground-tertiary">Or enter manually</span>
                    </div>
                  </div>

                  {/* Form Fields */}
                  <div className="space-y-4">
                    <div className="animate-fade-in-up stagger-1">
                      <label className="block text-sm font-medium text-foreground-secondary mb-2">
                        Email Subject
                      </label>
                      <Input
                        placeholder="Enter the email subject line"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      />
                    </div>

                    <div className="animate-fade-in-up stagger-2">
                      <label className="block text-sm font-medium text-foreground-secondary mb-2">
                        Email Body <span className="text-accent-danger">*</span>
                      </label>
                      <Textarea
                        placeholder="Paste the full email content here..."
                        className="min-h-[200px]"
                        value={formData.body}
                        onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                      />
                    </div>

                    <div className="animate-fade-in-up stagger-3">
                      <label className="block text-sm font-medium text-foreground-secondary mb-2">
                        Sender Email (optional)
                      </label>
                      <Input
                        type="email"
                        placeholder="attacker@example.com"
                        value={formData.senderEmail}
                        onChange={(e) => setFormData({ ...formData, senderEmail: e.target.value })}
                      />
                    </div>

                    <div className="animate-fade-in-up stagger-4">
                      <label className="block text-sm font-medium text-foreground-secondary mb-2">
                        Additional Notes (optional)
                      </label>
                      <Textarea
                        placeholder="Any context about this email..."
                        className="min-h-[80px]"
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4 pt-4">
                    <Button type="submit" className="flex-1" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        "Analyze Email"
                      )}
                    </Button>
                    <Button type="button" variant="secondary" onClick={clearForm}>
                      Clear
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
