import { TerminalContainer } from "@/components/Terminal";

export const SystemStatusFooter = () => {
  return (
    <TerminalContainer variant="default" className="mt-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-neon-lime animate-pulse"></div>
            <span className="text-sm text-text-secondary">All engines operational</span>
          </div>
          <span className="text-xs text-text-muted">
            Last updated: {new Date().toLocaleTimeString()}
          </span>
        </div>
        <div className="flex items-center space-x-4 text-xs text-text-muted">
          <span>Data sources: 12/12 active</span>
          <span>Latency: 14ms</span>
          <span>Integrity: 99.98%</span>
        </div>
      </div>
    </TerminalContainer>
  );
};