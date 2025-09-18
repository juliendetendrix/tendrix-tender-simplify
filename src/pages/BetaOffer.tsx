import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

const BetaOffer = () => {
  const features = [
    "Jusqu'à 5 réponses d'appels d'offres par mois",
    "Support prioritaire pendant toute la phase bêta",
    "Modèles de réponse personnalisés (Tendrix Winning Deck)",
    "Analyses de succès pour vos réponses",
    "Gestionnaire de compte dédié à votre entreprise"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg shadow-xl border bg-card">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-4xl font-bold text-foreground mb-3">
            Version Bêta Tendrix
          </CardTitle>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Pour les premières PME qui veulent tester l'outil avant la version Alpha.
          </p>
        </CardHeader>
        
        <CardContent className="space-y-8">
          {/* Prix */}
          <div className="text-center">
            <div className="text-5xl font-bold text-foreground mb-2">
              💶 5 €
            </div>
            <div className="text-muted-foreground text-lg">
              paiement unique
            </div>
          </div>
          
          {/* Liste des fonctionnalités */}
          <div className="space-y-4">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="flex-shrink-0 w-5 h-5 bg-primary rounded-full flex items-center justify-center mt-0.5">
                  <Check className="w-3 h-3 text-primary-foreground" />
                </div>
                <p className="text-foreground leading-relaxed">{feature}</p>
              </div>
            ))}
          </div>
          
          {/* Bouton CTA */}
          <div className="pt-6">
            <Button 
              size="lg"
              className="w-full h-14 text-lg font-bold bg-primary hover:bg-primary/90 text-primary-foreground"
              asChild
            >
              <a 
                href="https://buy.stripe.com/test_dRm3co3tYejR69L9mu3gk00"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center"
              >
                Je rejoins la Bêta pour 5 €
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BetaOffer;