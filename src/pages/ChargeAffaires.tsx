import { useEffect, useState } from "react";
import {
  LogOut, LayoutDashboard, Building2, FolderOpen,
  MessageSquare, User, Menu, X,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import tendrixLogo from "@/assets/tendrix-logo.png";
import { CAOverview } from "@/components/ca/CAOverview";
import { CACompanies } from "@/components/ca/CACompanies";
import { CADossiers } from "@/components/ca/CADossiers";
import { CAMessages } from "@/components/ca/CAMessages";
import { CAProfileEditor } from "@/components/ca/CAProfileEditor";

type Section = "overview" | "companies" | "dossiers" | "messages" | "profile";

const NAV_ITEMS: { id: Section; label: string; icon: React.FC<{ className?: string }> }[] = [
  { id: "overview",   label: "Tableau de bord", icon: LayoutDashboard },
  { id: "companies",  label: "Entreprises",      icon: Building2 },
  { id: "dossiers",   label: "Dossiers",         icon: FolderOpen },
  { id: "messages",   label: "Messages",         icon: MessageSquare },
  { id: "profile",    label: "Mon profil",       icon: User },
];

interface CAInfo {
  display_name: string;
  photo_url: string | null;
}

export default function ChargeAffaires() {
  const { user, signOut } = useAuth();
  const [section, setSection] = useState<Section>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [caInfo, setCAInfo] = useState<CAInfo | null>(null);

  const loadProfile = () => {
    if (!user) return;
    supabase
      .from("charge_affaires_profiles")
      .select("display_name, photo_url")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setCAInfo({ display_name: data.display_name, photo_url: (data as any).photo_url ?? null });
      });
  };

  useEffect(() => { loadProfile(); }, [user?.id]);

  const initials = caInfo?.display_name
    ?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) ?? "CA";

  const navigate = (s: string) => setSection(s as Section);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ─── Sidebar ─────────────────────────────────────────── */}
      <aside
        className={`
          fixed lg:relative inset-y-0 left-0 z-30 w-64 flex flex-col
          transform transition-transform duration-200 ease-in-out
          lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
        style={{ backgroundColor: "#0c1c98" }}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <img src={tendrixLogo} alt="Tendrix" className="h-6 brightness-0 invert" />
          <button className="lg:hidden text-white/60 hover:text-white" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Badge rôle */}
        <div className="px-5 py-3">
          <span className="text-xs font-bold uppercase tracking-widest"
                style={{ color: "#f9bd43" }}>
            Chargé d'affaires
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 pb-4 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
            const active = section === id;
            return (
              <button
                key={id}
                onClick={() => { setSection(id); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${
                  active
                    ? "bg-white/15 text-white"
                    : "text-white/60 hover:bg-white/8 hover:text-white"
                }`}
              >
                <Icon className="w-4.5 h-4.5 flex-shrink-0" />
                {label}
                {active && <div className="ml-auto w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "#f9bd43" }} />}
              </button>
            );
          })}
        </nav>

        {/* User footer */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={() => { setSection("profile"); setSidebarOpen(false); }}
            className="w-full flex items-center gap-3 mb-3 hover:opacity-80 transition-opacity text-left"
          >
            {caInfo?.photo_url ? (
              <img src={caInfo.photo_url} alt="" className="w-9 h-9 rounded-full object-cover border-2 border-white/20 flex-shrink-0" />
            ) : (
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm font-bold">{initials}</span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-semibold truncate">
                {caInfo?.display_name ?? "Mon profil"}
              </p>
              <p className="text-white/50 text-xs">Chargé d'affaires</p>
            </div>
          </button>
          <button
            onClick={signOut}
            className="w-full flex items-center gap-2 text-white/50 hover:text-white text-xs transition-colors py-1"
          >
            <LogOut className="w-4 h-4" />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* ─── Main content ────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Mobile top bar */}
        <header className="bg-white border-b px-4 py-3 flex items-center gap-3 lg:hidden shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="text-foreground">
            <Menu className="w-5 h-5" />
          </button>
          <img src={tendrixLogo} alt="Tendrix" className="h-5" />
          <span className="text-sm font-semibold text-primary ml-1">
            {NAV_ITEMS.find(n => n.id === section)?.label ?? "Espace CA"}
          </span>
        </header>

        {/* Section */}
        <main className="flex-1 overflow-y-auto">
          {section === "overview" && (
            <CAOverview userId={user?.id ?? ""} onNavigate={navigate} />
          )}
          {section === "companies" && (
            <CACompanies userId={user?.id ?? ""} />
          )}
          {section === "dossiers" && (
            <CADossiers userId={user?.id ?? ""} />
          )}
          {section === "messages" && (
            <CAMessages userId={user?.id ?? ""} />
          )}
          {section === "profile" && (
            <CAProfileEditor userId={user?.id ?? ""} onSaved={loadProfile} />
          )}
        </main>
      </div>
    </div>
  );
}
