import { Routes, Route } from "react-router-dom";
import Index from "@/pages/Index";

export const TerminalLayout = () => {
  return (
    <Routes>
      <Route path="*" element={<Index />} />
    </Routes>
  );
};