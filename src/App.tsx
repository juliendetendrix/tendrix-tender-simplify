import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { BetaQuestionnaireProvider } from "@/hooks/useBetaQuestionnaire";
import { AuthProvider } from "@/hooks/useAuth";
import { RequireAuth } from "@/components/RequireAuth";
import GlobalBetaQuestionnaire from "@/components/GlobalBetaQuestionnaire";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import NearbyTenders from "./pages/NearbyTenders";
import TopManagers from "./pages/TopManagers";
import BetaOffer from "./pages/BetaOffer";
import QuestionnairePME from "./pages/QuestionnairePME";
import TenderDetails from "./pages/TenderDetails";
import MobileApp from "./pages/MobileApp";
import MentionsLegales from "./pages/MentionsLegales";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import ChargeAffaires from "./pages/ChargeAffaires";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <BetaQuestionnaireProvider>
            <GlobalBetaQuestionnaire />
            <Toaster />
            <Sonner />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/nearby-tenders" element={<NearbyTenders />} />
              <Route path="/top-managers" element={<TopManagers />} />
              <Route path="/beta-offer" element={<BetaOffer />} />
              <Route path="/questionnaire-pme" element={<QuestionnairePME />} />
              <Route path="/tender-details" element={<TenderDetails />} />
              <Route
                path="/app"
                element={
                  <RequireAuth role="entreprise">
                    <MobileApp />
                  </RequireAuth>
                }
              />
              <Route
                path="/admin"
                element={
                  <RequireAuth role="admin">
                    <AdminDashboard />
                  </RequireAuth>
                }
              />
              <Route
                path="/charge-affaires"
                element={
                  <RequireAuth role="charge_affaires">
                    <ChargeAffaires />
                  </RequireAuth>
                }
              />
              <Route path="/mentions-legales" element={<MentionsLegales />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BetaQuestionnaireProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
