import { useState } from 'react';
import { TERMINAL_THEME } from '@/config/theme';

interface TerminalNavProps {
  onTabChange?: (tab: string) => void;
}

export function TerminalNav({ onTabChange }: TerminalNavProps) {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const tabs = ['DASHBOARD', 'INTELLIGENCE', 'CHARTS'];
  
  const handleTabClick = (tab: string) => {
    const tabLower = tab.toLowerCase();
    setActiveTab(tabLower);
    onTabChange?.(tabLower);
  };
  
  return (
    <div style={{
      borderBottom: `1px solid ${TERMINAL_THEME.colors.border.default}`,
      marginBottom: TERMINAL_THEME.spacing.lg,
      display: 'flex',
      gap: TERMINAL_THEME.spacing.xl
    }}>
      {tabs.map(tab => (
        <button
          key={tab}
          onClick={() => handleTabClick(tab)}
          style={{
            background: 'none',
            border: 'none',
            color: activeTab === tab.toLowerCase() 
              ? TERMINAL_THEME.colors.headers.primary 
              : TERMINAL_THEME.colors.text.secondary,
            fontSize: TERMINAL_THEME.typography.sizes.medium,
            fontFamily: TERMINAL_THEME.typography.fontFamily.mono,
            padding: `${TERMINAL_THEME.spacing.sm} 0`,
            cursor: 'pointer',
            borderBottom: activeTab === tab.toLowerCase() 
              ? `2px solid ${TERMINAL_THEME.colors.headers.primary}`
              : '2px solid transparent',
            fontWeight: TERMINAL_THEME.typography.weights.semibold,
            letterSpacing: '1px'
          }}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}