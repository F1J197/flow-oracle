import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { UnifiedDataDemo } from "./pages/UnifiedDataDemo";
import IntelligenceEngine from "./pages/IntelligenceEngine";
import { SystemDashboard } from "./pages/SystemDashboard";
import { UnifiedEngineTestPage } from "./pages/UnifiedEngineTest";
import { EngineRegistryProvider } from "./components/engines/EngineRegistryProvider";
import { TerminalThemeProvider } from "./components/providers/TerminalThemeProvider";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TerminalThemeProvider>
      <TooltipProvider>
        <EngineRegistryProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/unified-demo" element={<UnifiedDataDemo />} />
              <Route path="/intelligence" element={<IntelligenceEngine />} />
              <Route path="/system" element={<SystemDashboard />} />
              <Route path="/unified-test" element={<UnifiedEngineTestPage />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </EngineRegistryProvider>
      </TooltipProvider>
    </TerminalThemeProvider>
  </QueryClientProvider>
);

export default App;
