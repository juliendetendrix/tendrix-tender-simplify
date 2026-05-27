import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { X, Check } from 'lucide-react';

const comparisons = [
  {
    other: 'Abonnement mensuel, que vous postuliez ou non',
    tendrix: '1 crédit = 1 dossier. Vous payez quand vous postulez.',
  },
  {
    other: 'Conçu pour des équipes dédiées aux appels d\'offres',
    tendrix: 'Conçu pour les artisans et TPE du bâtiment',
  },
  {
    other: 'Prise de contact commerciale obligatoire pour démarrer',
    tendrix: 'Démarrez en autonomie, immédiatement',
  },
  {
    other: 'Crédits ou quotas qui expirent chaque mois',
    tendrix: 'Vos crédits n\'ont pas de date d\'expiration',
  },
];

const CreditPhilosophy = () => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section className="section-padding bg-muted/30">
      <div className="container-max">
        <div
          ref={ref}
          className={`max-w-3xl mx-auto transition-all duration-700 ${
            isVisible ? 'animate-fade-in-up' : 'opacity-0 translate-y-6'
          }`}
        >
          <div className="text-center mb-10">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Payez à l'usage. Rien de plus.
            </h2>
            <p className="text-lg text-muted-foreground">
              Un artisan ne répond pas à des marchés publics tous les jours.
              Pourquoi souscrire un abonnement mensuel ?
            </p>
          </div>

          <div className="bg-white border border-border rounded-xl overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-2 bg-muted/40 border-b border-border">
              <div className="px-6 py-3 text-sm font-semibold text-muted-foreground border-r border-border">
                Les autres solutions
              </div>
              <div className="px-6 py-3 text-sm font-semibold text-primary">
                Tendrix
              </div>
            </div>

            {/* Rows */}
            {comparisons.map((item, i) => (
              <div
                key={i}
                className={`grid grid-cols-2 border-b border-border last:border-0 ${
                  i % 2 === 0 ? 'bg-white' : 'bg-muted/10'
                }`}
              >
                <div className="px-6 py-4 flex items-start gap-3 border-r border-border">
                  <X className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                  <span className="text-muted-foreground text-sm leading-relaxed">{item.other}</span>
                </div>
                <div className="px-6 py-4 flex items-start gap-3">
                  <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-foreground text-sm font-medium leading-relaxed">{item.tendrix}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CreditPhilosophy;
