import React from 'react';
import { Header } from '@/components/layout/Header';
import { MasterPromptIntegratedDashboard } from '@/components/dashboard/MasterPromptIntegratedDashboard';

export const MasterPrompts = () => {
  return (
    <div className="min-h-screen bg-bg-primary">
      <Header currentPage="master-prompts" />
      <main>
        <MasterPromptIntegratedDashboard />
      </main>
    </div>
  );
};