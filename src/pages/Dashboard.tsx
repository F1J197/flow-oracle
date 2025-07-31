import React from 'react';
import { Header } from '@/components/layout/Header';
import { TerminalDashboard } from '@/components/dashboard/TerminalDashboard';

export const Dashboard = () => {
  return (
    <div className="min-h-screen bg-bg-primary">
      <Header currentPage="dashboard" />
      <main>
        <TerminalDashboard />
      </main>
    </div>
  );
};