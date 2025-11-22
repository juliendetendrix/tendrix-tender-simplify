import { useState } from "react";
import { Bell } from "lucide-react";
import { LastMinuteAO } from "@/components/mobile/LastMinuteAO";
import { MesDemandes } from "@/components/mobile/MesDemandes";
import { MonCompte } from "@/components/mobile/MonCompte";
import { BottomNav } from "@/components/mobile/BottomNav";
import tendrixLogo from "@/assets/tendrix-logo-blue.png";

type Tab = "last-minute" | "requests" | "account";

export interface TenderRequest {
  id: string;
  tenderId: string;
  tenderTitle: string;
  location: string;
  budget: string;
  deadline: string;
  status: "En attente" | "En cours" | "Terminée";
  createdAt: Date;
}

export default function MobileApp() {
  const [activeTab, setActiveTab] = useState<Tab>("last-minute");
  const [requests, setRequests] = useState<TenderRequest[]>([]);

  const handleRequestResponse = (tender: {
    id: string;
    title: string;
    location: string;
    budget: string;
    deadline: string;
  }) => {
    const newRequest: TenderRequest = {
      id: `req-${Date.now()}`,
      tenderId: tender.id,
      tenderTitle: tender.title,
      location: tender.location,
      budget: tender.budget,
      deadline: tender.deadline,
      status: "En attente",
      createdAt: new Date(),
    };
    setRequests([newRequest, ...requests]);
    setActiveTab("requests");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-[430px] mx-auto">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-border px-4 py-3 flex items-center justify-between">
        <img src={tendrixLogo} alt="Tendrix" className="h-6" />
        <button className="p-2 hover:bg-muted rounded-full transition-colors">
          <Bell className="w-5 h-5" style={{ color: '#0c1c98' }} />
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-20">
        {activeTab === "last-minute" && (
          <LastMinuteAO onRequestResponse={handleRequestResponse} />
        )}
        {activeTab === "requests" && <MesDemandes requests={requests} />}
        {activeTab === "account" && <MonCompte />}
      </main>

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
