import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { TerminalLayout } from "@/components/layout/TerminalLayout";
import { ErrorBoundary } from "@/components/error/ErrorBoundary";
import { TerminalThemeProvider } from "@/components/providers/TerminalThemeProvider";
import { MotionProvider } from "@/components/providers/MotionProvider";
import './index.css';

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary fallbackTitle="LIQUIDITY² Terminal Error">
    <TerminalThemeProvider>
      <MotionProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Toaster />
            <BrowserRouter>
              <Routes>
                <Route path="*" element={<TerminalLayout />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </QueryClientProvider>
      </MotionProvider>
    </TerminalThemeProvider>
  </ErrorBoundary>
);

export default App;