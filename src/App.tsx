import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { BetaQuestionnaireProvider } from "@/hooks/useBetaQuestionnaire";
import GlobalBetaQuestionnaire from "@/components/GlobalBetaQuestionnaire";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import NearbyTenders from "./pages/NearbyTenders";
import WinningDeck from "./pages/WinningDeck";
import TopManagers from "./pages/TopManagers";
import BetaOffer from "./pages/BetaOffer";
import QuestionnairePME from "./pages/QuestionnairePME";
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
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/nearby-tenders" element={<NearbyTenders />} />
            <Route path="/winning-deck" element={<WinningDeck />} />
            <Route path="/top-managers" element={<TopManagers />} />
            <Route path="/beta-offer" element={<BetaOffer />} />
            <Route path="/questionnaire-pme" element={<QuestionnairePME />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </BetaQuestionnaireProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
