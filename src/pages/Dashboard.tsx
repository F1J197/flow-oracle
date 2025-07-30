import { TerminalDashboard } from "@/components/dashboard/TerminalDashboard";
import { ErrorBoundary } from "@/components/intelligence/ErrorBoundary";
import { LoadingDiagnostics } from "@/components/debug/LoadingDiagnostics";
import { ContextDebugger } from "@/components/dashboard/ContextDebugger";

export const Dashboard = () => {
  console.log('📊 Dashboard component initializing...');
  console.log('🎯 Dashboard route loaded, rendering TerminalDashboard...');
  
  return (
    <>
      <LoadingDiagnostics />
      <ErrorBoundary
        onError={(error, errorInfo) => {
          console.error('🚨 Dashboard ErrorBoundary caught error:', error, errorInfo);
        }}
        fallback={
          <div className="bg-bg-primary text-text-primary font-mono h-screen flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="text-neon-orange text-2xl">⚠️ TERMINAL ERROR</div>
              <div className="text-text-secondary">Dashboard failed to initialize</div>
              <button 
                onClick={() => window.location.reload()} 
                className="bg-neon-teal/20 text-neon-teal border border-neon-teal/30 px-4 py-2 font-mono"
              >
                RELOAD TERMINAL
              </button>
            </div>
          </div>
        }
      >
        <TerminalDashboard />
        <ContextDebugger />
      </ErrorBoundary>
    </>
  );
};