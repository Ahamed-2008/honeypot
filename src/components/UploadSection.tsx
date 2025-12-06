import { motion } from "framer-motion";
import { Upload, Mail, FileText, AlertCircle } from "lucide-react";
import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { AnimatedSection } from "@/components/AnimatedSection";

export function UploadSection() {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
    }
  }, []);

  return (
    <section id="upload" className="py-24 lg:py-32">
      <div className="section-container">
        <AnimatedSection className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            Upload & Analyze
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Drop your suspicious email to detect phishing tactics and generate intelligent persona responses.
          </p>
        </AnimatedSection>

        <AnimatedSection delay={0.2}>
          <div className="max-w-2xl mx-auto">
            <div className="card-elevated card-hover p-8">
              {/* Upload Zone */}
              <motion.div
                className={`upload-zone ${isDragging ? "drag-over" : ""} ${file ? "border-accent" : ""}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <div className="flex flex-col items-center text-center">
                  <motion.div
                    animate={{ y: isDragging ? -5 : 0 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center mb-4"
                  >
                    {file ? (
                      <FileText className="h-6 w-6 text-accent" />
                    ) : (
                      <Upload className="h-6 w-6 text-accent" />
                    )}
                  </motion.div>
                  
                  {file ? (
                    <div>
                      <p className="font-medium mb-1">{file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="font-medium mb-1">
                        Drop your email here or{" "}
                        <span className="text-accent cursor-pointer hover:underline">browse</span>
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Supports .txt, .eml, .html files
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Alternative: Manual Input */}
              <div className="mt-6 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">
                    Or enter manually
                  </span>
                  <div className="flex-1 h-px bg-border" />
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Email Subject</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Enter the email subject line"
                        className="w-full h-11 pl-10 pr-4 rounded-lg bg-secondary/50 border border-border focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Attacker Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input
                        type="email"
                        placeholder="Enter the attacker's email address"
                        className="w-full h-11 pl-10 pr-4 rounded-lg bg-secondary/50 border border-border focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Email Body</label>
                    <textarea
                      placeholder="Paste the email content here..."
                      rows={5}
                      className="w-full p-4 rounded-lg bg-secondary/50 border border-border focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all outline-none resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-6">
                <Button variant="gradient" className="flex-1">
                  <AlertCircle className="h-4 w-4" />
                  Analyze Email
                </Button>
                <Button variant="outline" onClick={() => setFile(null)}>
                  Clear
                </Button>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
