import React from 'react';
import { ResponsiveLayout } from '@/components/layout/ResponsiveLayout';
import { AlertsTriggersWidget } from '@/components/alerts/AlertsTriggersWidget';

const AlertsDashboard: React.FC = () => {
  return (
    <ResponsiveLayout currentPage="system">
      <div className="terminal-container space-y-6">
        <div className="terminal-header-section">
          <h1 className="terminal-header">ALERTS & TRIGGERS</h1>
          <p className="text-terminal-muted">
            Real-time monitoring and automated trigger management
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <AlertsTriggersWidget />
        </div>
      </div>
    </ResponsiveLayout>
  );
};

export default AlertsDashboard;