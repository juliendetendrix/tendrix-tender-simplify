import { Clock, FileText, User } from "lucide-react";

type Tab = "last-minute" | "requests" | "account";

interface BottomNavProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const tabs = [
    { id: "last-minute" as Tab, icon: Clock, label: "Last Minute AO" },
    { id: "requests" as Tab, icon: FileText, label: "Mes demandes" },
    { id: "account" as Tab, icon: User, label: "Mon compte" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-border max-w-[430px] mx-auto">
      <div className="flex items-center justify-around px-2 py-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-lg transition-all min-w-[80px] ${
                isActive ? "bg-[#0c1c98]/5" : "hover:bg-muted/50"
              }`}
            >
              <Icon
                className="w-5 h-5"
                style={{ color: isActive ? "#0c1c98" : "#64748b" }}
              />
              <span
                className="text-xs font-medium"
                style={{ color: isActive ? "#0c1c98" : "#64748b" }}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
