import { useEffect, useState } from "react";
import { Bell, X, Sparkles, MapPin, Euro } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface RecommendedTenderNotificationProps {
  delayMs?: number;
}

export function RecommendedTenderNotification({ delayMs = 2500 }: RecommendedTenderNotificationProps) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissed = sessionStorage.getItem("tendrix-reco-notif-dismissed");
    if (dismissed) return;
    const t = setTimeout(() => {
      setOpen(true);
      requestAnimationFrame(() => setVisible(true));
    }, delayMs);
    return () => clearTimeout(t);
  }, [delayMs]);

  const close = () => {
    setVisible(false);
    sessionStorage.setItem("tendrix-reco-notif-dismissed", "1");
    setTimeout(() => setOpen(false), 250);
  };

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={close}
        className={`fixed inset-0 z-[60] bg-black/30 backdrop-blur-sm transition-opacity duration-300 ${
          visible ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Notification card */}
      <div
        className={`fixed top-3 left-1/2 -translate-x-1/2 z-[70] w-[calc(100%-1.5rem)] max-w-[410px] transition-all duration-300 ease-out ${
          visible ? "translate-y-0 opacity-100" : "-translate-y-8 opacity-0"
        }`}
      >
        <div className="bg-white rounded-2xl shadow-2xl border border-border overflow-hidden">
          {/* iOS-style header */}
          <div className="flex items-center gap-2 px-4 pt-3 pb-2 border-b border-border/60">
            <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center shrink-0">
              <Bell className="w-3.5 h-3.5 text-primary-foreground" fill="currentColor" />
            </div>
            <span className="text-xs font-semibold text-foreground tracking-wide">TENDRIX</span>
            <span className="text-[10px] text-muted-foreground ml-auto">à l'instant</span>
            <button
              onClick={close}
              className="p-1 -mr-1 rounded-full hover:bg-muted transition-colors"
              aria-label="Fermer"
            >
              <X className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 space-y-3">
            <div className="flex items-start gap-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary/20 text-[10px] font-bold uppercase tracking-wide text-secondary-foreground shrink-0">
                <Sparkles className="w-3 h-3" />
                Recommandé pour vous
              </span>
            </div>

            <h3 className="text-sm font-semibold text-foreground leading-snug">
              Rénovation énergétique d'un groupe scolaire — Mairie de Lyon
            </h3>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Cet appel d'offres correspond à <span className="font-semibold text-primary">92%</span> à votre profil
              (secteur, zone géographique, budget).
            </p>

            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                Lyon (69)
              </span>
              <span className="flex items-center gap-1">
                <Euro className="w-3.5 h-3.5" />
                ~ 240 000 €
              </span>
            </div>

            <div className="flex gap-2 pt-1">
              <Button
                variant="outline"
                onClick={close}
                className="flex-1 h-10 text-xs"
              >
                Plus tard
              </Button>
              <Button
                onClick={() => {
                  close();
                  navigate("/tender-details?id=reco-demo");
                }}
                className="flex-1 h-10 text-xs font-semibold"
              >
                Voir l'opportunité
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
