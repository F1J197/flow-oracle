import { Routes, Route } from "react-router-dom";
import Index from "@/pages/Index";
import Charts from "@/pages/Charts";
import Intelligence from "@/pages/Intelligence";
import Reports from "@/pages/Reports";
import MetricsDeepDive from "@/pages/MetricsDeepDive";
import NarrativeSummary from "@/pages/NarrativeSummary";
import AlertsDashboard from "@/pages/AlertsDashboard";
import NotFound from "@/pages/NotFound";

export const TerminalLayout = () => {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/charts" element={<MetricsDeepDive />} />
      <Route path="/intelligence" element={<NarrativeSummary />} />
      <Route path="/reports" element={<Reports />} />
      <Route path="/system" element={<AlertsDashboard />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};