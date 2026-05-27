import { Clock, FileText, User, MessageCircle, Plus } from "lucide-react";

type Tab = "opportunites" | "dossiers" | "compte";

interface BottomNavProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  onAdd: () => void;
  onMessages: () => void;
  hasUnreadMessages?: boolean;
}

export function BottomNav({
  activeTab,
  onTabChange,
  onAdd,
  onMessages,
  hasUnreadMessages = false,
}: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto bg-white border-t border-border/60 shadow-[0_-4px_16px_0_rgba(12,28,152,0.07)]">
      <div className="flex items-end justify-between px-3 pt-2 pb-4">

        <NavItem icon={Clock} label="AO" isActive={activeTab === "opportunites"} onClick={() => onTabChange("opportunites")} />
        <NavItem icon={FileText} label="Dossiers" isActive={activeTab === "dossiers"} onClick={() => onTabChange("dossiers")} />

        {/* Bouton + central surélevé */}
        <button
          onClick={onAdd}
          aria-label="Importer une opportunité"
          className="-mt-6 flex flex-col items-center"
        >
          <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-[0_4px_14px_0_rgba(12,28,152,0.4)] hover:bg-primary/90 active:scale-95 transition-all">
            <Plus className="w-6 h-6 text-white" />
          </div>
        </button>

        {/* Messages */}
        <button
          onClick={onMessages}
          className="flex flex-col items-center gap-1 px-2 py-1 rounded-xl transition-all hover:bg-muted/50"
        >
          <div className="relative">
            <MessageCircle className="w-5 h-5 text-muted-foreground" />
            {hasUnreadMessages && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-secondary border-2 border-white" />
            )}
          </div>
          <span className="text-[11px] font-medium text-muted-foreground">Messages</span>
        </button>

        <NavItem icon={User} label="Compte" isActive={activeTab === "compte"} onClick={() => onTabChange("compte")} />
      </div>
    </nav>
  );
}

function NavItem({
  icon: Icon,
  label,
  isActive,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1 px-2 py-1 rounded-xl transition-all ${
        isActive ? "bg-primary/8" : "hover:bg-muted/50"
      }`}
    >
      <Icon className={`w-5 h-5 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
      <span className={`text-[11px] font-medium ${isActive ? "text-primary" : "text-muted-foreground"}`}>
        {label}
      </span>
    </button>
  );
}
