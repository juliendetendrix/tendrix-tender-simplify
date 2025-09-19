import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { BetaQuestionnaireProvider } from "@/hooks/useBetaQuestionnaire";
import GlobalBetaQuestionnaire from "@/components/GlobalBetaQuestionnaire";
import Index from "./pages/Index";
import BetaOffer from "./pages/BetaOffer";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BetaQuestionnaireProvider>
        <BrowserRouter>
          <GlobalBetaQuestionnaire />
          <Toaster />
          <Sonner />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/beta-offer" element={<BetaOffer />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </BetaQuestionnaireProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
