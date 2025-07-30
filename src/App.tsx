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
import { ConsoleLogger } from "./components/debug/ConsoleLogger";
import { AppErrorBoundary } from "./components/error/AppErrorBoundary";
import { debugLogger, appLogger } from "./utils/debugLogger";

const queryClient = new QueryClient();

// Initialize app logging
appLogger.initialization('Starting LIQUIDITY² application');

const App = () => {
  appLogger.initialization('App component initializing...');
  
  try {
    return (
      <AppErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <TerminalThemeProvider>
            <TooltipProvider>
              <EngineRegistryProvider>
                <ConsoleLogger />
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
      </AppErrorBoundary>
    );
  } catch (error) {
    appLogger.error('App component error', error);
    return (
      <div style={{ 
        color: 'white', 
        backgroundColor: 'black', 
        padding: '20px', 
        fontFamily: 'monospace' 
      }}>
        <h1>Application Error</h1>
        <p>An error occurred while loading the application:</p>
        <pre>{error instanceof Error ? error.message : String(error)}</pre>
      </div>
    );
  }
};

export default App;
