import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { Coins } from "lucide-react";
import { LastMinuteAO } from "@/components/mobile/LastMinuteAO";
import { MesDossiers } from "@/components/mobile/MesDossiers";
import { MonCompte } from "@/components/mobile/MonCompte";
import { DemoChat } from "@/components/mobile/DemoChat";
import { MessagesInbox, CA_THREAD_ID } from "@/components/mobile/MessagesInbox";
import { BottomNav } from "@/components/mobile/BottomNav";
import { Tarification } from "@/components/mobile/Tarification";
import { ChargeAffairesWelcome } from "@/components/mobile/ChargeAffairesWelcome";
import { toast } from "@/hooks/use-toast";
import { useCAProfile } from "@/hooks/useCAProfile";
import { useCredits } from "@/hooks/useCredits";
import { useAuth } from "@/hooks/useAuth";
import tendrixLogo from "@/assets/tendrix-logo-blue.png";

type Tab = "opportunites" | "dossiers" | "compte";

interface OpenedChat {
  id: string;
  title: string;
  isCADirect?: boolean;
}

export default function MobileApp() {
  const { ca, initials: caInitials } = useCAProfile();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  // Permet d'arriver directement sur un onglet via /app?tab=dossiers
  const initialTab = (["opportunites", "dossiers", "compte"].includes(searchParams.get("tab") ?? "")
    ? (searchParams.get("tab") as Tab)
    : "opportunites");
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);
  const [openedChat, setOpenedChat] = useState<OpenedChat | null>(null);
  const [messagesOpen, setMessagesOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [welcomeOpen, setWelcomeOpen] = useState(false);
  const [tarifOpen, setTarifOpen] = useState(false);

  // Solde réel de crédits, mis à jour en direct (Realtime)
  const { credits: liveCredits } = useCredits();
  const credits = liveCredits ?? 0;

  // Popup d'accueil : affichée une fois PAR COMPTE (clé liée à l'utilisateur),
  // pour que chaque nouvel inscrit la voie, même dans le même navigateur.
  const welcomeKey = user ? `tendrix_ca_welcome_seen_${user.id}` : null;
  useEffect(() => {
    if (!welcomeKey) return;
    if (!localStorage.getItem(welcomeKey)) {
      // On laisse l'utilisateur découvrir l'app ~10 s avant d'afficher la popup
      const timer = setTimeout(() => setWelcomeOpen(true), 10000);
      return () => clearTimeout(timer);
    }
  }, [welcomeKey]);

  // Ouverture directe d'une conversation via ?chat=ca (expert) ou ?chat=<requestId>
  // (depuis la fiche analyse, boutons "Discuter avec mon CA" / "Répondre à ce marché").
  const chatHandled = useRef(false);
  useEffect(() => {
    if (chatHandled.current) return;
    const chat = searchParams.get("chat");
    if (!chat) return;
    chatHandled.current = true;
    if (chat === "ca") {
      setOpenedChat({ id: CA_THREAD_ID, title: ca.display_name || "Mon chargé d'affaires", isCADirect: true });
    } else {
      setActiveTab("dossiers");
      setOpenedChat({ id: chat, title: searchParams.get("title") || "Votre dossier" });
    }
  }, [searchParams, ca.display_name]);

  // Retour de paiement Stripe (?purchase=success|cancel). Les crédits sont
  // ajoutés par le webhook → le compteur se met à jour seul (Realtime).
  const purchaseHandled = useRef(false);
  useEffect(() => {
    if (purchaseHandled.current) return;
    const p = searchParams.get("purchase");
    if (!p) return;
    purchaseHandled.current = true;
    setActiveTab("compte");
    if (p === "success") {
      toast({ title: "Paiement réussi 🎉", description: "Tes crédits seront crédités dans quelques secondes." });
    } else if (p === "cancel") {
      toast({ title: "Paiement annulé", description: "Aucun montant n'a été débité." });
    }
  }, [searchParams]);

  const handleWelcomeClose = () => {
    if (welcomeKey) localStorage.setItem(welcomeKey, "true");
    setWelcomeOpen(false);
  };

  const handleContactCA = () => {
    handleWelcomeClose();
    setOpenedChat({ id: CA_THREAD_ID, title: ca.display_name, isCADirect: true });
  };

  const handleRequestCreated = () => {
    setActiveTab("dossiers");
  };

  const handleAdd = () => {
    setActiveTab("opportunites");
    setAddOpen(true);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-[430px] mx-auto">
      <ChargeAffairesWelcome
        isOpen={welcomeOpen}
        onClose={handleWelcomeClose}
        onContactCA={handleContactCA}
        ca={ca}
        caInitials={caInitials}
      />

      <header className="sticky top-0 z-50 bg-white px-4 py-3 flex items-center justify-between shadow-[0_1px_0_0_#e5e7eb,0_2px_8px_0_rgba(12,28,152,0.06)]">
        <img src={tendrixLogo} alt="Tendrix" className="h-7" />

        {/* Compteur de crédits — cliquable pour en acheter */}
        <button
          onClick={() => setTarifOpen(true)}
          className="flex items-center gap-2 bg-primary px-3.5 py-2 rounded-xl shadow-sm hover:opacity-90 transition-opacity"
          aria-label="Acheter des crédits"
        >
          <Coins className="w-4 h-4 text-secondary" />
          <span className="text-sm font-bold text-white leading-none">{credits}</span>
          <span className="text-xs text-white/70 font-medium leading-none">
            crédit{credits > 1 ? "s" : ""}
          </span>
          <span className="ml-1 text-sm font-bold leading-none" style={{ color: "#f9bd43" }}>+</span>
        </button>
      </header>

      <main className="flex-1 overflow-y-auto pb-24">
        {tarifOpen ? (
          <Tarification onBack={() => setTarifOpen(false)} />
        ) : openedChat ? (
          <DemoChat
            dossierTitle={openedChat.title}
            onBack={() => setOpenedChat(null)}
            isCADirect={openedChat.isCADirect}
            ca={ca}
            caInitials={caInitials}
          />
        ) : messagesOpen ? (
          <MessagesInbox
            onBack={() => setMessagesOpen(false)}
            onOpenChat={(id, title, isCADirect) => {
              setMessagesOpen(false);
              setOpenedChat({ id, title, isCADirect });
            }}
            ca={ca}
            caInitials={caInitials}
          />
        ) : (
          <>
            {activeTab === "opportunites" && (
              <LastMinuteAO
                onRequestCreated={handleRequestCreated}
                addOpen={addOpen}
                onAddOpenChange={setAddOpen}
              />
            )}
            {activeTab === "dossiers" && (
              <MesDossiers
                onOpenChat={(id, title) => setOpenedChat({ id, title })}
              />
            )}
            {activeTab === "compte" && (
              <MonCompte
                onOpenCAChat={() =>
                  setOpenedChat({ id: CA_THREAD_ID, title: ca.display_name, isCADirect: true })
                }
              />
            )}
          </>
        )}
      </main>

      {!openedChat && !messagesOpen && !tarifOpen && (
        <BottomNav
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onAdd={handleAdd}
          onMessages={() => setMessagesOpen(true)}
          hasUnreadMessages={true}
        />
      )}
    </div>
  );
}
