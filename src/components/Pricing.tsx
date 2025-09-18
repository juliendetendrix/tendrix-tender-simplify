import { Check } from 'lucide-react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

const Pricing = () => {
  const { ref: sectionRef, isVisible } = useScrollAnimation();
  const plans = [
    {
      name: 'Starter',
      price: '€99',
      period: '/mois',
      description: 'Parfait pour les petites entreprises qui démarrent',
      features: [
        'Jusqu\'à 5 réponses d\'appels d\'offres par mois',
        'Correspondance d\'appels d\'offres de base',
        'Support par email',
        'Modèles de réponse standard',
      ],
      popular: false,
    },
    {
      name: 'Pro',
      price: '€299',
      period: '/mois',
      description: 'Pour les entreprises en croissance qui ont besoin de plus',
      features: [
        'Jusqu\'à 20 réponses d\'appels d\'offres par mois',
        'Correspondance IA avancée',
        'Support prioritaire',
        'Modèles de réponse personnalisés',
        'Analyses de succès',
        'Gestionnaire de compte dédié',
      ],
      popular: true,
    },
    {
      name: 'Enterprise',
      price: 'Sur mesure',
      period: '',
      description: 'Solutions personnalisées pour les grandes organisations',
      features: [
        'Réponses d\'appels d\'offres illimitées',
        'Correspondance de niveau entreprise',
        'Support téléphonique 24/7',
        'Modèles entièrement personnalisés',
        'Analyses et rapports avancés',
        'Accès API',
        'Options marque blanche',
      ],
      popular: false,
    },
  ];

  return (
    <section ref={sectionRef} id="pricing" className="section-padding bg-gradient-hero">
      <div className="container-max">
        <div className={`text-center mb-16 transition-all duration-800 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
          <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-6">
            Tarifs simples et transparents
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Choisissez le plan qui correspond aux besoins de votre entreprise
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`bg-white rounded-2xl p-8 shadow-soft hover:shadow-medium transition-all duration-300 border-2 relative ${
                plan.popular 
                  ? 'border-primary scale-105 animate-pulse-glow' 
                  : 'border-border hover:border-primary/50'
              } ${
                isVisible ? 'animate-scale-in' : 'opacity-0 scale-95'
              }`}
              style={{ animationDelay: `${0.1 + index * 0.2}s` }}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-semibold">
                    Le plus populaire
                  </span>
                </div>
              )}
              
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-foreground mb-2">
                  {plan.name}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {plan.description}
                </p>
                <div className="flex items-baseline justify-center">
                  <span className="text-4xl font-bold text-foreground">
                    {plan.price}
                  </span>
                  <span className="text-muted-foreground ml-1">
                    {plan.period}
                  </span>
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center">
                    <Check className="h-5 w-5 text-primary mr-3 flex-shrink-0" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-300 ${
                  plan.popular
                    ? 'btn-primary'
                    : 'btn-outline'
                }`}
              >
                Choisir ce plan
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;