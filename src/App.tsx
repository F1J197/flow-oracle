import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Dashboard } from "./pages/Dashboard";
import Intelligence from "./pages/Intelligence";
import Charts from "./pages/Charts";
import { SystemDashboard } from "./pages/SystemDashboard";
import { MasterPrompts } from "./pages/MasterPrompts";
import NotFound from "./pages/NotFound";
import { EngineRegistryProvider } from "./components/engines/EngineRegistryProvider";
import { TerminalThemeProvider } from "./components/providers/TerminalThemeProvider";
import { DataOrchestratorProvider } from "./components/providers/DataOrchestratorProvider";
import { AppErrorBoundary } from "./components/error/AppErrorBoundary";
import { debugLogger } from "./utils/debugLogger";
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

debugLogger.info('APP_INIT', 'LIQUIDITY² Application Starting...');

const App: React.FC = () => {
  return (
    <AppErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TerminalThemeProvider>
          <DataOrchestratorProvider>
            <EngineRegistryProvider>
              <TooltipProvider>
                <BrowserRouter>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/intelligence" element={<Intelligence />} />
                    <Route path="/charts" element={<Charts />} />
                    <Route path="/system" element={<SystemDashboard />} />
                    <Route path="/master-prompts" element={<MasterPrompts />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </BrowserRouter>
                <Toaster />
                <Sonner />
              </TooltipProvider>
            </EngineRegistryProvider>
          </DataOrchestratorProvider>
        </TerminalThemeProvider>
      </QueryClientProvider>
    </AppErrorBoundary>
  );
};

export default App;
