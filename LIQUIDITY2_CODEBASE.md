# LIQUIDITY² TERMINAL - COMPLETE CODEBASE

## Project Structure
```
src/
├── App.css
├── App.tsx
├── components/
│   ├── Charts/
│   │   └── ChartsView.tsx
│   ├── Dashboard/
│   │   ├── DashboardView.tsx
│   │   └── index.ts
│   ├── Intelligence/
│   │   └── IntelligenceView.tsx
│   ├── Navigation/
│   │   └── TerminalNav.tsx
│   ├── Terminal/
│   │   ├── TerminalBox.tsx
│   │   ├── TerminalChart.tsx
│   │   ├── TerminalContainer.tsx
│   │   ├── TerminalGrid.tsx
│   │   ├── TerminalHeader.tsx
│   │   ├── TerminalMetric.tsx
│   │   ├── TerminalStatus.tsx
│   │   ├── TerminalTable.tsx
│   │   ├── TerminalTile.tsx
│   │   └── index.ts
│   ├── credit/
│   │   └── CreditRegimeIndicator.tsx
│   ├── error/
│   │   └── AppErrorBoundary.tsx
│   ├── indicators/
│   │   └── IndicatorConfigInterface.tsx
│   ├── initialization/
│   │   └── ProgressiveLoader.tsx
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Navigation.tsx
│   │   ├── ResponsiveLayout.tsx
│   │   ├── StandardLayout.tsx
│   │   └── TabNavigation.tsx
│   ├── momentum/
│   │   ├── MomentumChart.tsx
│   │   └── MomentumDashboard.tsx
│   ├── performance/
│   │   └── PerformanceMonitor.tsx
│   ├── providers/
│   │   └── TerminalThemeProvider.tsx
│   └── ui/ (40+ shadcn/ui components)
├── config/
│   ├── api.config.ts
│   ├── charts.config.ts
│   ├── environment.ts
│   ├── fredSymbolMapping.ts
│   ├── fredSymbols.ts
│   ├── index.ts
│   ├── indicators.config.ts
│   ├── masterPromptsIndicators.config.ts
│   ├── providerSymbolMappings.enhanced.ts
│   ├── providerSymbolMappings.ts
│   ├── terminal.tokens.ts
│   ├── theme.ts
│   ├── unifiedIndicators.config.ts
│   └── unifiedSymbolMapping.ts
├── engines/
│   ├── BaseEngine.ts
│   ├── TestEngine.ts
│   ├── TestEngine/
│   │   ├── components/
│   │   │   └── DashboardTile.tsx
│   │   └── index.ts
│   └── foundation/
│       └── EnhancedMomentumEngine/
│           ├── components/
│           │   ├── DashboardTile.tsx
│           │   └── IntelligenceView.tsx
│           └── index.ts
├── hooks/
│   ├── use-mobile.tsx
│   ├── use-toast.ts
│   └── useTerminalTheme.ts
├── integrations/
│   └── supabase/
│       ├── client.ts
│       └── types.ts
├── lib/
│   └── utils.ts
├── pages/
│   ├── Charts.tsx
│   ├── ChartsView.tsx
│   ├── Index.tsx
│   ├── Intelligence.tsx
│   └── NotFound.tsx
├── styles/
│   ├── intelligence.css
│   └── tiles.css
├── types/
│   ├── data.ts
│   ├── dealerPositions.ts
│   ├── engines.ts
│   ├── indicators.ts
│   ├── intelligenceView.ts
│   ├── primaryDealerTile.ts
│   └── zscoreTypes.ts
├── utils/
│   ├── BrowserEventEmitter.ts
│   ├── KalmanFilter.ts
│   ├── debugLogger.ts
│   ├── formatting.ts
│   ├── productionLogger.ts
│   ├── statistics.ts
│   └── terminalCompliance.ts
├── index.css
├── main.tsx
├── nav-items.tsx
└── vite-env.d.ts
```

## Core Application Files

### FILE: src/App.tsx
```typescript
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { navItems } from "./nav-items";
import { TERMINAL_THEME } from "@/config/theme";
import './index.css';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <div style={{ 
          backgroundColor: TERMINAL_THEME.colors.background.primary,
          fontFamily: TERMINAL_THEME.typography.fontFamily.mono,
          color: TERMINAL_THEME.colors.text.primary,
          minHeight: '100vh'
        }}>
          <Routes>
            {navItems.map(({ to, page }) => (
              <Route key={to} path={to} element={page} />
            ))}
          </Routes>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
```

### FILE: src/main.tsx
```typescript
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById("root")!).render(<App />);
```

### FILE: src/nav-items.tsx
```typescript
import { Home, BarChart3, Brain, Settings } from "lucide-react";
import Index from "./pages/Index";
import Charts from "./pages/Charts";
import Intelligence from "./pages/Intelligence";
import NotFound from "./pages/NotFound";

export const navItems = [
  {
    title: "Home",
    to: "/",
    icon: <Home className="h-4 w-4" />,
    page: <Index />,
  },
  {
    title: "Charts",
    to: "/charts",
    icon: <BarChart3 className="h-4 w-4" />,
    page: <Charts />,
  },
  {
    title: "Intelligence",
    to: "/intelligence",
    icon: <Brain className="h-4 w-4" />,
    page: <Intelligence />,
  },
  {
    title: "System",
    to: "/system",
    icon: <Settings className="h-4 w-4" />,
    page: <NotFound />,
  },
];
```

### FILE: src/vite-env.d.ts
```typescript
/// <reference types="vite/client" />
```

### FILE: src/lib/utils.ts
```typescript
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

---

*Note: This is a comprehensive codebase with 88+ TypeScript files. The complete documentation contains all source files from the LIQUIDITY² Terminal project, implementing a Bloomberg-style financial terminal with real-time market data analysis engines.*

*For the complete file contents of all 88 files, please refer to the individual files in the src/ directory. This documentation provides the project structure and core application files to understand the overall architecture.*

## Key Components Summary

### Dashboard Components
- **DashboardView.tsx**: Main terminal grid with 15 engine tiles (5x3 Bloomberg-style layout)
- **EnhancedMomentumEngine**: Critical foundation engine with momentum analysis
- **TestEngine**: System validation engine

### Layout Components  
- **TerminalThemeProvider**: Bloomberg terminal theme enforcement
- **ResponsiveLayout**: Responsive container system
- **TabNavigation**: Terminal-style navigation

### Engine System
- **BaseEngine.ts**: Abstract base class for all engines
- **Enhanced Momentum Engine**: Foundation pillar engine with velocity/acceleration analysis
- **Test Engine**: System validation and testing

### Configuration
- **theme.ts**: Complete Bloomberg terminal theme specification
- **indicators.config.ts**: 50+ financial indicator configurations
- **api.config.ts**: External API endpoint configurations

### Types System
- **engines.ts**: Engine interface definitions
- **indicators.ts**: Financial indicator type definitions
- **data.ts**: Market data structure definitions

### Utilities
- **statistics.ts**: Mathematical calculation utilities
- **KalmanFilter.ts**: State estimation for liquidity analysis
- **terminalCompliance.ts**: Bloomberg terminal compliance enforcement