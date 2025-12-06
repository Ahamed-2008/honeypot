import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Upload from "./pages/Upload";
import Analysis from "./pages/Analysis";
import History from "./pages/History";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster 
        position="bottom-right" 
        toastOptions={{
          style: {
            background: "hsl(var(--background-secondary))",
            border: "1px solid hsl(var(--border))",
            color: "hsl(var(--foreground))",
          },
        }}
      />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/analysis/:id" element={<Analysis />} />
          <Route path="/history" element={<History />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
