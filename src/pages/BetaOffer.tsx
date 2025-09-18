import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Info } from 'lucide-react';

const BetaOffer = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-lg border-0 bg-card">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-3xl font-bold text-primary mb-2">
            Accédez à la version Bêta Tendrix
          </CardTitle>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Un espace privé pour recevoir vos appels d'offres, adaptés à votre entreprise. 
            Offre limitée aux premières PME.
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Prix */}
          <div className="text-center p-6 bg-secondary/30 rounded-lg">
            <div className="text-2xl font-semibold text-primary mb-2">
              💶 Participation symbolique : 5 € 
            </div>
            <div className="text-sm text-muted-foreground">
              (paiement unique)
            </div>
          </div>
          
          {/* Phrase de réassurance */}
          <div className="bg-accent/20 p-4 rounded-lg border-l-4 border-primary">
            <p className="text-foreground leading-relaxed">
              Votre engagement initial comptera : nous porterons une attention particulière 
              à nos premières entreprises dans la durée.
            </p>
          </div>
          
          {/* Boutons */}
          <div className="space-y-4 pt-4">
            <Button 
              size="lg"
              className="w-full h-14 text-lg font-semibold"
              asChild
            >
              <a 
                href="https://buy.stripe.com/test_dRm3co3tYejR69L9mu3gk00"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2"
              >
                Je rejoins la Bêta pour 5 €
                <ArrowRight className="h-5 w-5" />
              </a>
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm"
              className="w-full text-muted-foreground hover:text-foreground"
            >
              <Info className="h-4 w-4 mr-2" />
              En savoir plus
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BetaOffer;