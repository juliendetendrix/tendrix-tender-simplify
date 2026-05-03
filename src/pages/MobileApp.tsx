import { useState } from "react";
import { Bell, LogOut } from "lucide-react";
import { LastMinuteAO } from "@/components/mobile/LastMinuteAO";
import { MesDossiers } from "@/components/mobile/MesDossiers";
import { MonCompte } from "@/components/mobile/MonCompte";
import { DossierDetail } from "@/components/mobile/DossierDetail";
import { BottomNav } from "@/components/mobile/BottomNav";
import { useAuth } from "@/hooks/useAuth";
import tendrixLogo from "@/assets/tendrix-logo-new.png";

type Tab = "opportunites" | "dossiers" | "compte";

export default function MobileApp() {
  const { signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("opportunites");
  const [openedDossier, setOpenedDossier] = useState<string | null>(null);

  const handleRequestCreated = () => {
    setActiveTab("dossiers");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-[430px] mx-auto">
      <header className="sticky top-0 z-50 bg-white border-b border-border px-4 py-3 flex items-center justify-between">
        <img src={tendrixLogo} alt="Tendrix" className="h-8" />
        <div className="flex items-center gap-1">
          <button className="p-2 hover:bg-muted rounded-full transition-colors">
            <Bell className="w-5 h-5 text-primary" />
          </button>
          <button
            onClick={signOut}
            className="p-2 hover:bg-muted rounded-full transition-colors"
            aria-label="Déconnexion"
          >
            <LogOut className="w-5 h-5 text-primary" />
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-20">
        {openedDossier ? (
          <DossierDetail requestId={openedDossier} onBack={() => setOpenedDossier(null)} />
        ) : (
          <>
            {activeTab === "opportunites" && (
              <LastMinuteAO onRequestCreated={handleRequestCreated} />
            )}
            {activeTab === "dossiers" && (
              <MesDossiers onOpenDossier={setOpenedDossier} />
            )}
            {activeTab === "compte" && <MonCompte />}
          </>
        )}
      </main>

      {!openedDossier && (
        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      )}
    </div>
  );
}
