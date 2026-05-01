import { useEffect, useState } from "react";
import { LogOut, ChevronRight, MessageSquare, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { DossierDetail } from "@/components/mobile/DossierDetail";
import tendrixLogo from "@/assets/tendrix-logo-blue.png";

interface Row {
  id: string;
  status: string;
  created_at: string;
  tender: { title: string; deadline: string | null; organisme: string | null } | null;
  company: { name: string } | null;
}

const STATUS_LABEL: Record<string, string> = {
  demande: "Demandé",
  en_cours: "En cours",
  soumis: "Soumis",
  gagne: "Gagné",
  perdu: "Perdu",
};

export default function ChargeAffaires() {
  const { user, signOut } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [opened, setOpened] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      const { data } = await supabase
        .from("tender_requests")
        .select("id, status, created_at, tender:tenders(title,deadline,organisme), company:companies(name)")
        .eq("charge_affaires_id", user.id)
        .order("created_at", { ascending: false });
      setRows((data ?? []) as any);
      setLoading(false);
    };
    load();
  }, [user?.id]);

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src={tendrixLogo} alt="Tendrix" className="h-6" />
          <span className="text-sm font-semibold text-primary">Chargé d'affaires</span>
        </div>
        <Button variant="ghost" size="sm" onClick={signOut}>
          <LogOut className="w-4 h-4 mr-1" />
          Déconnexion
        </Button>
      </header>

      <main className="max-w-3xl mx-auto p-4 space-y-4">
        {opened ? (
          <div className="bg-white border rounded-lg overflow-hidden">
            <DossierDetail requestId={opened} onBack={() => setOpened(null)} />
          </div>
        ) : (
          <>
            <h1 className="text-xl font-bold text-primary">Mes dossiers assignés</h1>

            {loading ? (
              <Skeleton className="h-32 w-full" />
            ) : rows.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">
                Aucun dossier assigné pour le moment.
              </p>
            ) : (
              <div className="space-y-3">
                {rows.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setOpened(r.id)}
                    className="w-full bg-white border rounded-lg p-4 text-left hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm">{r.tender?.title ?? "Dossier"}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {r.company?.name ?? "Entreprise"}
                        </div>
                        {r.tender?.deadline && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {r.tender.deadline}
                          </div>
                        )}
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                        {STATUS_LABEL[r.status] ?? r.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-1 text-xs text-primary">
                        <MessageSquare className="w-3.5 h-3.5" />
                        Ouvrir le dossier
                      </div>
                      <ChevronRight className="w-4 h-4 text-primary" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
