import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import tendrixLogo from "@/assets/tendrix-logo-blue.png";

interface RecommendedTenderNotificationProps {
  delayMs?: number;
}

export function RecommendedTenderNotification({ delayMs = 2500 }: RecommendedTenderNotificationProps) {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("tendrix-reco-notif-dismissed")) return;
    const t = setTimeout(() => {
      setMounted(true);
      requestAnimationFrame(() => setVisible(true));
    }, delayMs);
    return () => clearTimeout(t);
  }, [delayMs]);

  const dismiss = () => {
    setVisible(false);
    sessionStorage.setItem("tendrix-reco-notif-dismissed", "1");
    setTimeout(() => setMounted(false), 300);
  };

  const handleTap = () => {
    sessionStorage.setItem("tendrix-reco-notif-dismissed", "1");
    setVisible(false);
    setTimeout(() => {
      setMounted(false);
      navigate("/tender-details?id=reco-demo");
    }, 200);
  };

  if (!mounted) return null;

  return (
    <div
      className={`fixed top-2 left-1/2 -translate-x-1/2 z-[80] w-[calc(100%-1rem)] max-w-[400px] transition-all duration-300 ease-out ${
        visible ? "translate-y-0 opacity-100" : "-translate-y-16 opacity-0"
      }`}
      role="alert"
    >
      <button
        onClick={handleTap}
        onTouchStart={(e) => {
          const startY = e.touches[0].clientY;
          const target = e.currentTarget;
          const move = (ev: TouchEvent) => {
            const dy = ev.touches[0].clientY - startY;
            if (dy < 0) target.style.transform = `translateY(${dy}px)`;
          };
          const end = (ev: TouchEvent) => {
            const dy = (ev.changedTouches[0].clientY - startY);
            target.style.transform = "";
            if (dy < -40) dismiss();
            window.removeEventListener("touchmove", move);
            window.removeEventListener("touchend", end);
          };
          window.addEventListener("touchmove", move);
          window.addEventListener("touchend", end);
        }}
        className="w-full text-left bg-white/85 backdrop-blur-2xl rounded-[22px] shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-black/5 px-3.5 py-2.5 active:scale-[0.99] transition-transform"
      >
        <div className="flex items-start gap-2.5">
          <div className="w-9 h-9 rounded-[8px] bg-white flex items-center justify-center shrink-0 overflow-hidden border border-black/5">
            <img src={tendrixLogo} alt="" className="w-7 h-7 object-contain" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2">
              <span className="text-[13px] font-semibold text-black truncate">Tendrix</span>
              <span className="text-[11px] text-black/50 ml-auto shrink-0">maintenant</span>
            </div>
            <p className="text-[13px] font-semibold text-black leading-tight mt-0.5">
              Nouvel appel d'offres recommandé
            </p>
            <p className="text-[13px] text-black/70 leading-snug mt-0.5 line-clamp-2">
              Rénovation énergétique — Mairie de Lyon · 92% de compatibilité avec votre profil.
            </p>
          </div>
        </div>
      </button>
    </div>
  );
}
