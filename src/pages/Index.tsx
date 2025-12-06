import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { UploadSection } from "@/components/UploadSection";
import { AnalysisSection } from "@/components/AnalysisSection";
import { HistorySection } from "@/components/HistorySection";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <UploadSection />
        <AnalysisSection />
        <HistorySection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
