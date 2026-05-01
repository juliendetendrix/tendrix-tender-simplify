import { Clock, FileText, User } from "lucide-react";

type Tab = "opportunites" | "dossiers" | "compte";

interface BottomNavProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const tabs = [
    { id: "opportunites" as Tab, icon: Clock, label: "Opportunités" },
    { id: "dossiers" as Tab, icon: FileText, label: "Mes dossiers" },
    { id: "compte" as Tab, icon: User, label: "Mon compte" },
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
                isActive ? "bg-primary/5" : "hover:bg-muted/50"
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
              <span className={`text-xs font-medium ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
