import { Check } from 'lucide-react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { useNavigate } from 'react-router-dom';

const packs = [
  {
    name: 'Découverte',
    credits: 3,
    priceLabel: 'Gratuit',
    perCredit: 'Pour commencer',
    description: 'Testez la plateforme sans engagement.',
    featured: false,
    cta: 'Commencer gratuitement',
    features: [
      '3 dossiers de réponse complets',
      'Résumé IA de chaque appel d\'offres',
      'Filtrage par métier et zone',
      'Score de compatibilité',
    ],
  },
  {
    name: 'Artisan',
    credits: 10,
    priceLabel: '79 €',
    perCredit: '7,90 € par dossier',
    description: 'Pour les artisans qui répondent régulièrement.',
    featured: true,
    cta: 'Choisir ce pack',
    features: [
      '10 dossiers de réponse complets',
      'Résumé IA de chaque appel d\'offres',
      'Filtrage par métier et zone',
      'Score de compatibilité avancé',
      'Crédits sans expiration',
      'Support prioritaire',
    ],
  },
  {
    name: 'Pro',
    credits: 25,
    priceLabel: '149 €',
    perCredit: '5,96 € par dossier',
    description: 'Pour les entreprises très actives sur les marchés.',
    featured: false,
    cta: 'Choisir ce pack',
    features: [
      '25 dossiers de réponse complets',
      'Résumé IA de chaque appel d\'offres',
      'Filtrage par métier et zone',
      'Score de compatibilité avancé',
      'Crédits sans expiration',
      'Support prioritaire',
      'Accès anticipé aux nouvelles fonctions',
    ],
  },
];

const Pricing = () => {
  const { ref, isVisible } = useScrollAnimation();
  const navigate = useNavigate();

  return (
    <section ref={ref} id="tarifs" className="section-padding bg-background">
      <div className="container-max">
        <div
          className={`text-center mb-14 transition-all duration-700 ${
            isVisible ? 'animate-fade-in-up' : 'opacity-0 translate-y-6'
          }`}
        >
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Des crédits, pas un abonnement.
          </h2>
          <p className="text-lg text-muted-foreground max-w-lg mx-auto">
            Achetez des crédits quand vous en avez besoin. Ils n'expirent jamais.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 items-stretch">
          {packs.map((pack, i) => (
            <div
              key={i}
              className={`rounded-xl p-8 flex flex-col relative transition-all duration-300 ${
                pack.featured
                  ? 'bg-primary text-white border-2 border-primary shadow-strong md:scale-105'
                  : 'bg-white border border-border hover:shadow-medium'
              }`}
            >
              {pack.featured && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="bg-secondary text-secondary-foreground px-4 py-1 rounded-full text-xs font-bold whitespace-nowrap">
                    Le plus populaire
                  </span>
                </div>
              )}

              <div className="mb-6">
                <p className={`text-sm font-medium mb-1 ${pack.featured ? 'text-white/60' : 'text-muted-foreground'}`}>
                  {pack.credits} crédits
                </p>
                <h3 className={`text-xl font-bold mb-1 ${pack.featured ? 'text-white' : 'text-foreground'}`}>
                  {pack.name}
                </h3>
                <p className={`text-sm mb-5 ${pack.featured ? 'text-white/65' : 'text-muted-foreground'}`}>
                  {pack.description}
                </p>
                <div className={`text-4xl font-black mb-1 ${pack.featured ? 'text-white' : 'text-foreground'}`}>
                  {pack.priceLabel}
                </div>
                <p className={`text-sm font-medium ${pack.featured ? 'text-secondary' : 'text-primary'}`}>
                  {pack.perCredit}
                </p>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {pack.features.map((feature, j) => (
                  <li key={j} className="flex items-start gap-3">
                    <Check className={`w-4 h-4 flex-shrink-0 mt-0.5 ${pack.featured ? 'text-secondary' : 'text-primary'}`} />
                    <span className={`text-sm ${pack.featured ? 'text-white/85' : 'text-muted-foreground'}`}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => navigate('/questionnaire-pme')}
                className={`w-full py-3 rounded-lg font-semibold text-sm transition-all duration-200 ${
                  pack.featured
                    ? 'bg-secondary text-secondary-foreground hover:opacity-90'
                    : 'btn-primary'
                }`}
              >
                {pack.cta}
              </button>
            </div>
          ))}
        </div>

        <p className="text-center text-muted-foreground text-sm mt-8">
          Paiement sécurisé · Les crédits n'ont pas de date d'expiration · Prix TTC
        </p>
      </div>
    </section>
  );
};

export default Pricing;
