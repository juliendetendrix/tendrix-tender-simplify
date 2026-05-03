import { useState } from "react";
import { MessageCircle, LogOut, Plus } from "lucide-react";
import { LastMinuteAO } from "@/components/mobile/LastMinuteAO";
import { MesDossiers } from "@/components/mobile/MesDossiers";
import { MonCompte } from "@/components/mobile/MonCompte";
import { DemoChat } from "@/components/mobile/DemoChat";
import { MessagesInbox } from "@/components/mobile/MessagesInbox";
import { BottomNav } from "@/components/mobile/BottomNav";
import { useAuth } from "@/hooks/useAuth";
import tendrixLogo from "@/assets/tendrix-logo-blue.png";

type Tab = "opportunites" | "dossiers" | "compte";

export default function MobileApp() {
  const { signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("opportunites");
  const [openedChat, setOpenedChat] = useState<{ id: string; title: string } | null>(null);
  const [messagesOpen, setMessagesOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

  const handleRequestCreated = () => {
    setActiveTab("dossiers");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-[430px] mx-auto">
      <header className="sticky top-0 z-50 bg-white border-b border-border px-4 py-3 flex items-center justify-between">
        <img src={tendrixLogo} alt="Tendrix" className="h-8" />
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setActiveTab("opportunites");
              setAddOpen(true);
            }}
            className="w-9 h-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors shadow-sm"
            aria-label="Importer une opportunité"
          >
            <Plus className="w-5 h-5" />
          </button>
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
        {openedChat ? (
          <DemoChat
            dossierTitle={openedChat.title}
            onBack={() => setOpenedChat(null)}
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
            {activeTab === "compte" && <MonCompte />}
          </>
        )}
      </main>

      {!openedChat && (
        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      )}
    </div>
  );
}
