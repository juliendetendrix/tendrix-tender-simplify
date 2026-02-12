import { Check } from 'lucide-react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { useBetaQuestionnaire } from '@/hooks/useBetaQuestionnaire';

const Pricing = () => {
  const { ref: sectionRef, isVisible } = useScrollAnimation();
  const { openQuestionnaire } = useBetaQuestionnaire();
  
  const trialFeatures = [
    "Référencement de votre entreprise dans notre base qualifiée",
    "3 rendez-vous stratégiques avec nos experts marchés publics",
    "15 jours d'accès complet à la plateforme Tendrix",
    "Création d'un modèle de réponse sur-mesure (Tendrix Winning Deck)",
    "Un chargé d'affaires dédié à votre accompagnement"
  ];

  return (
    <section ref={sectionRef} id="pricing" className="section-padding bg-gradient-hero">
      <div className="container-max">
        <div className={`text-center mb-16 transition-all duration-800 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
          <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-6">
            Offre Essai Gratuit
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Rejoignez les premières PME qui testent Tendrix gratuitement
          </p>
        </div>

        <div className="flex justify-center">
          <div className={`bg-white rounded-2xl p-8 shadow-soft hover:shadow-medium transition-all duration-300 border-2 border-primary scale-105 max-w-lg w-full relative ${
            isVisible ? 'animate-scale-in' : 'opacity-0 scale-95'
          }`}>
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-semibold">
                Accès limité
              </span>
            </div>
            
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-foreground mb-2">
                Essai Gratuit Tendrix
              </h3>
              <p className="text-muted-foreground mb-4">
                Pour les premières PME qui souhaitent tester l'outil gratuitement
              </p>
              <p className="text-sm text-primary font-medium">Sur prise de rendez-vous</p>
            </div>

            <ul className="space-y-4 mb-8">
              {trialFeatures.map((feature, featureIndex) => (
                <li key={featureIndex} className="flex items-center">
                  <Check className="h-5 w-5 text-primary mr-3 flex-shrink-0" />
                  <span className="text-muted-foreground">{feature}</span>
                </li>
              ))}
            </ul>

            <button
              className="btn-primary w-full py-3 px-6 rounded-xl font-semibold transition-all duration-300"
              onClick={openQuestionnaire}
            >
              Commencer mon essai gratuit
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;