import { TerminalDashboard } from "@/components/dashboard/TerminalDashboard";

export const Dashboard = () => {
  console.log('📊 Dashboard component initializing...');
  try {
    return <TerminalDashboard />;
  } catch (error) {
    console.error('🚨 Dashboard component error:', error);
    return (
      <div style={{ 
        color: 'white', 
        backgroundColor: 'black', 
        padding: '20px', 
        fontFamily: 'monospace' 
      }}>
        <h1>Dashboard Error</h1>
        <p>An error occurred while loading the dashboard:</p>
        <pre>{error instanceof Error ? error.message : String(error)}</pre>
      </div>
    );
  }
};