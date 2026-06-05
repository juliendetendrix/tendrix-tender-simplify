import React, { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { BetaQuestionnaireProvider } from "@/hooks/useBetaQuestionnaire";
import { AuthProvider, useAuth, defaultRouteForRole } from "@/hooks/useAuth";
import { RequireAuth } from "@/components/RequireAuth";
import GlobalBetaQuestionnaire from "@/components/GlobalBetaQuestionnaire";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import BetaOffer from "./pages/BetaOffer";
import QuestionnairePME from "./pages/QuestionnairePME";
import TenderDetails from "./pages/TenderDetails";
import AnalysisDetail from "./pages/AnalysisDetail";
import ResponseDetail from "./pages/ResponseDetail";
import MobileApp from "./pages/MobileApp";
import MentionsLegales from "./pages/MentionsLegales";
import Login from "./pages/Login";
import LoginCA from "./pages/LoginCA";
import InscriptionCA from "./pages/InscriptionCA";
import AdminDashboard from "./pages/AdminDashboard";
import ChargeAffaires from "./pages/ChargeAffaires";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Capturé au tout premier chargement du module, AVANT que le client Supabase
// ne nettoie le hash de l'URL (#access_token=…&type=…). Permet de savoir par
// quel type de lien l'utilisateur est arrivé même après nettoyage.
const INITIAL_HASH = typeof window !== "undefined" ? window.location.hash : "";
const ARRIVED_VIA_RECOVERY = /type=recovery/.test(INITIAL_HASH);
const ARRIVED_VIA_MAGICLINK = /access_token/.test(INITIAL_HASH) && /type=(magiclink|signup|invite)/.test(INITIAL_HASH);
const PUBLIC_LANDING_PATHS = ["/", "/login", "/login-ca"];

/**
 * Aiguille les arrivées par email, où qu'elles atterrissent (y compris sur
 * l'accueil quand Supabase retombe sur la Site URL) :
 *  - lien de récupération → page de saisie du nouveau mot de passe ;
 *  - lien magique / inscription → espace de l'utilisateur selon son rôle.
 */
function AuthRedirectHandler() {
  const navigate = useNavigate();
  const { session, roles, loading } = useAuth();

  // Récupération de mot de passe (indépendant du rôle).
  useEffect(() => {
    if (ARRIVED_VIA_RECOVERY && !window.location.pathname.startsWith("/reset-password")) {
      navigate("/reset-password", { replace: true });
    }
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        navigate("/reset-password", { replace: true });
      }
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  // Lien magique tombé sur une page publique → redirige vers l'espace du rôle.
  useEffect(() => {
    if (loading || !session || roles.length === 0) return;
    if (ARRIVED_VIA_MAGICLINK && PUBLIC_LANDING_PATHS.includes(window.location.pathname)) {
      navigate(defaultRouteForRole(roles[0]), { replace: true });
    }
  }, [session, roles, loading, navigate]);

  return null;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <BetaQuestionnaireProvider>
            <AuthRedirectHandler />
            <GlobalBetaQuestionnaire />
            <Toaster />
            <Sonner />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/beta-offer" element={<BetaOffer />} />
              <Route path="/questionnaire-pme" element={<QuestionnairePME />} />
              <Route path="/tender-details" element={<TenderDetails />} />
              <Route path="/analysis" element={<AnalysisDetail />} />
              <Route path="/response" element={<ResponseDetail />} />
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
              <Route path="/login-ca" element={<LoginCA />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/inscription-ca" element={<InscriptionCA />} />
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
