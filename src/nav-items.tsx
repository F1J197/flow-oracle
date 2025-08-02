import { Home, BarChart3, Brain, Settings, FileText } from "lucide-react";
import Index from "./pages/Index";
import Charts from "./pages/Charts";
import Intelligence from "./pages/Intelligence";
import Reports from "./pages/Reports";
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
    title: "Reports",
    to: "/reports",
    icon: <FileText className="h-4 w-4" />,
    page: <Reports />,
  },
  {
    title: "System",
    to: "/system",
    icon: <Settings className="h-4 w-4" />,
    page: <NotFound />,
  },
];