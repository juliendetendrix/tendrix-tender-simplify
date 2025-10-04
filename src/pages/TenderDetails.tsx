import { ArrowLeft, MapPin, Calendar, Euro, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import tendrixLogo from "@/assets/tendrix-logo-blue.png";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const TenderDetails = () => {
  const navigate = useNavigate();
  const { ref: contentRef, isVisible } = useScrollAnimation();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Notification Chip */}
      <div className="bg-[#0c1c98] text-white text-center py-2 px-4 text-xs sm:text-sm animate-fade-in">
        ✨ Nouveau – reçu il y a 3 min
      </div>

      {/* Header with curved bottom */}
      <header className="bg-white relative pb-8 pt-4 px-4">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="h-10 w-10 text-[#0c1c98] hover:bg-[#0c1c98]/10"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <img src={tendrixLogo} alt="Tendrix" className="h-7" />
          <div className="w-10" /> {/* Spacer */}
        </div>
        {/* Curved bottom shape */}
        <div className="absolute bottom-0 left-0 right-0 h-6 bg-gray-50 rounded-t-[2rem]" />
      </header>

      {/* Main Content */}
      <main className="max-w-lg mx-auto px-4 -mt-2 pb-32">
        <div
          ref={contentRef}
          className={`space-y-5 transition-all duration-500 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          {/* Main Card */}
          <div className="bg-white rounded-2xl shadow-lg p-5 space-y-4">
            {/* Title */}
            <h1 className="text-xl font-bold text-[#0c1c98] leading-tight">
              Construction de 4 maisons individuelles
            </h1>

            {/* Summary */}
            <div className="space-y-2">
              <p className="text-sm text-gray-600 leading-relaxed">
                Marché de travaux pour 4 maisons neuves : maçonnerie, charpente, couverture, second œuvre. 
                Durée prévisionnelle 10 mois.
              </p>
            </div>

            {/* Key Info Grid */}
            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-[#f9bd43] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-500 font-medium">Localisation</p>
                  <p className="text-base font-semibold text-gray-900">Dordogne</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Euro className="h-5 w-5 text-[#f9bd43] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-500 font-medium">Budget estimé</p>
                  <p className="text-base font-semibold text-gray-900">320 000 € HT</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-[#f9bd43] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-500 font-medium">Date limite</p>
                  <p className="text-base font-semibold text-gray-900">15 octobre 2025</p>
                </div>
              </div>
            </div>

            {/* Info Chips */}
            <div className="flex flex-wrap gap-2 pt-2">
              <Badge variant="secondary" className="text-xs px-3 py-1 bg-blue-50 text-[#0c1c98] border-0">
                Travaux
              </Badge>
              <Badge variant="secondary" className="text-xs px-3 py-1 bg-blue-50 text-[#0c1c98] border-0">
                Lot unique
              </Badge>
              <Badge variant="secondary" className="text-xs px-3 py-1 bg-blue-50 text-[#0c1c98] border-0">
                Prix 60%
              </Badge>
              <Badge variant="secondary" className="text-xs px-3 py-1 bg-blue-50 text-[#0c1c98] border-0">
                Technique 40%
              </Badge>
              <Badge variant="secondary" className="text-xs px-3 py-1 bg-blue-50 text-[#0c1c98] border-0">
                Pénalités délais
              </Badge>
            </div>
          </div>

          {/* Compatibility Card */}
          <div className="bg-white rounded-2xl shadow-lg p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-[#0c1c98]">
                Compatibilité avec votre entreprise
              </h3>
              <span className="text-2xl font-bold text-[#f9bd43]">82%</span>
            </div>
            <Progress value={82} className="h-2.5" />
            
            {/* Success Badge */}
            <div className="flex items-center gap-2 pt-2">
              <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-0 text-xs px-3 py-1.5">
                <TrendingUp className="h-3.5 w-3.5 mr-1" />
                Chances : moyennes à élevées
              </Badge>
            </div>
          </div>
        </div>
      </main>

      {/* Sticky CTA Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg z-10">
        <div className="max-w-lg mx-auto">
          <Button
            size="lg"
            className="w-full bg-[#f9bd43] hover:bg-[#f9bd43]/90 text-[#0c1c98] font-bold text-base py-6 rounded-xl shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
            onClick={() => navigate('/dashboard')}
          >
            Demander une réponse
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TenderDetails;
