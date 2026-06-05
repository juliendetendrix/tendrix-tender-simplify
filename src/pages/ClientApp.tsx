import { useIsMobile } from "@/hooks/use-mobile";
import MobileApp from "./MobileApp";
import DesktopApp from "./DesktopApp";

// Aiguillage responsive : app mobile (< 768px) ou desktop (sidebar façon Iziao).
export default function ClientApp() {
  const isMobile = useIsMobile();
  return isMobile ? <MobileApp /> : <DesktopApp />;
}
