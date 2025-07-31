import React from 'react';
import { Header } from '@/components/layout/Header';
import { UnifiedTerminalDashboard } from '@/components/dashboard/UnifiedTerminalDashboard';

export const Dashboard = () => {
  return (
    <div className="min-h-screen bg-bg-primary">
      <Header currentPage="dashboard" />
      <main>
        <UnifiedTerminalDashboard />
      </main>
    </div>
  );
};