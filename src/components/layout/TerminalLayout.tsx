import { Routes, Route } from "react-router-dom";
import Index from "@/pages/Index";
import Charts from "@/pages/Charts";
import Intelligence from "@/pages/Intelligence";
import Reports from "@/pages/Reports";
import NotFound from "@/pages/NotFound";

export const TerminalLayout = () => {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/charts" element={<Charts />} />
      <Route path="/intelligence" element={<Intelligence />} />
      <Route path="/reports" element={<Reports />} />
      <Route path="/system" element={<NotFound />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};