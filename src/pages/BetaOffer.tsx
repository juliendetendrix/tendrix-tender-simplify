import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

const BetaOffer = () => {
  const features = [
    "Jusqu'à 3 réponses par mois pendant toute la phase bêta",
    "Support prioritaire pendant toute la phase bêta",
    "Modèles de réponse personnalisés (Tendrix Winning Deck)",
    "Onboarding personnalisé",
    "Réponse en moins de 4 h pour des appels d'offres fournitures",
    "1 chargé d'affaires référent dédié à votre entreprise"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        
        {/* Bloc Intro */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Merci pour vos réponses !
          </h1>
          <div className="mb-8">
            <p className="text-lg font-semibold text-primary">
              Projet innovant incubé à Station F
            </p>
          </div>
          <div className="max-w-3xl mx-auto">
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              Nous sommes au tout début de l'aventure Tendrix et en pleine phase de développement de notre solution.
              Pour construire cet outil avec vous, nous lançons une version bêta exceptionnelle, réservée à un nombre limité de PME.
              Cet accès est proposé à un prix symbolique unique de 5 €, bien en dessous de la valeur réelle de ce service, 
              afin de remercier nos premières entreprises partenaires et d'avancer ensemble.
            </p>
          </div>
        </div>

        {/* Carte Offre Bêta */}
        <div className="flex justify-center mb-16">
          <Card className="w-full max-w-md bg-background border-2 rounded-3xl shadow-lg p-8">
            <CardContent className="space-y-8 p-0">
              {/* Titre */}
              <div className="text-center">
                <h2 className="text-3xl font-bold text-foreground mb-4">
                  Version bêta Tendrix
                </h2>
                <p className="text-muted-foreground text-base leading-relaxed">
                  Pour les premières PME qui souhaitent tester l'outil avant la version alpha.
                </p>
              </div>
              
              {/* Prix */}
              <div className="text-center py-4">
                <div className="text-6xl font-bold text-foreground mb-2">
                  5€
                </div>
                <div className="text-muted-foreground text-base">
                  paiement unique
                </div>
              </div>
              
              {/* Liste des fonctionnalités */}
              <div className="space-y-6">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center mt-0.5">
                      <Check className="w-5 h-5 text-primary" />
                    </div>
                    <p className="text-muted-foreground leading-relaxed text-base">{feature}</p>
                  </div>
                ))}
              </div>
              
              {/* Bouton CTA */}
              <div className="pt-8">
                <Button 
                  variant="outline"
                  size="lg"
                  className="w-full h-14 text-lg font-semibold border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground rounded-2xl transition-transform duration-200 hover:scale-105"
                  asChild
                >
                  <a 
                    href="https://buy.stripe.com/test_dRm3co3tYejR69L9mu3gk00"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center"
                  >
                    Intégrer la version bêta
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bloc Confiance */}
        <div className="text-center">
          <div className="max-w-2xl mx-auto">
            <p className="text-lg text-muted-foreground leading-relaxed">
              Une offre exceptionnelle, disponible uniquement pendant la phase de développement. 
              Les premières entreprises qui rejoignent la bêta bénéficient d'une attention particulière 
              et sont nos partenaires privilégiés pour la suite.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default BetaOffer;