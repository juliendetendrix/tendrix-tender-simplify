import { ArrowLeft, MapPin, Calendar, Euro, FileText, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import tendrixLogo from "@/assets/tendrix-logo-blue.png";

const TenderDetails = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-10">
        <div className="container-max mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="h-9 w-9"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <img src={tendrixLogo} alt="Tendrix" className="h-8" />
          </div>
          <h1 className="text-lg md:text-xl font-semibold text-[#0c1c98]">
            Détail de l'appel d'offre
          </h1>
          <div className="w-9" /> {/* Spacer for alignment */}
        </div>
      </header>

      {/* Main Content */}
      <main className="container-max mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Main Tender Card */}
          <Card className="border-2">
            <CardHeader className="bg-gradient-to-r from-[#0c1c98]/5 to-[#f9bd43]/5">
              <CardTitle className="text-2xl md:text-3xl text-[#0c1c98]">
                Construction de 4 maisons individuelles
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {/* Summary */}
              <div>
                <h2 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Résumé
                </h2>
                <p className="text-base leading-relaxed">
                  Le marché porte sur la construction de 4 maisons individuelles neuves en Dordogne 
                  (maçonnerie, charpente, couverture, second œuvre). Travaux prévus sur une durée de 10 mois.
                </p>
              </div>

              {/* Key Information Grid */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                  <MapPin className="h-5 w-5 text-[#0c1c98] mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Localisation</p>
                    <p className="text-base font-semibold">Dordogne, Nouvelle-Aquitaine</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                  <Euro className="h-5 w-5 text-[#0c1c98] mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Budget estimé</p>
                    <p className="text-base font-semibold">320 000 € HT</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                  <Calendar className="h-5 w-5 text-[#0c1c98] mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Date limite de réponse</p>
                    <p className="text-base font-semibold">15 octobre 2025</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                  <TrendingUp className="h-5 w-5 text-[#0c1c98] mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Type de marché</p>
                    <p className="text-base font-semibold">Marché public de travaux</p>
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              <div className="p-4 rounded-lg bg-blue-50 border border-blue-100">
                <h3 className="font-semibold text-[#0c1c98] mb-2">Informations complémentaires</h3>
                <p className="text-sm leading-relaxed text-foreground">
                  Marché public de travaux, lot unique, critères d'attribution : prix 60%, valeur technique 40%.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Compatibility Score Card */}
          <Card className="border-2 border-[#f9bd43]">
            <CardContent className="pt-6 space-y-6">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-[#0c1c98]">
                    Compatibilité avec votre entreprise
                  </h3>
                  <span className="text-3xl font-bold text-[#f9bd43]">82%</span>
                </div>
                <Progress value={82} className="h-3" />
              </div>

              <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                <p className="text-sm font-medium text-green-800 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Chances de remporter ce marché : <span className="font-bold">Moyennes à élevées</span>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* CTA Button */}
          <div className="flex justify-center pt-4">
            <Button
              size="lg"
              className="bg-[#f9bd43] hover:bg-[#f9bd43]/90 text-[#0c1c98] font-bold text-lg px-12 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all"
              onClick={() => navigate('/dashboard')}
            >
              Demander une réponse
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TenderDetails;
