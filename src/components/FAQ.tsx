import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

const FAQ = () => {
  const { ref: sectionRef, isVisible } = useScrollAnimation();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: 'Comment Tendrix trouve-t-il les appels d\'offres pertinents pour mon entreprise ?',
      answer: 'Notre système de correspondance alimenté par l\'IA analyse votre profil d\'entreprise, vos capacités et vos performances passées pour identifier les opportunités d\'appels d\'offres les plus pertinentes parmi les milliers d\'avis de marchés publics publiés quotidiennement.',
    },
    {
      question: 'À quelle vitesse puis-je obtenir une réponse d\'appel d\'offres ?',
      answer: 'La plupart des réponses d\'appels d\'offres sont livrées dans les 24 h à 48 h. Pour les échéances urgentes, nous proposons un service express avec des réponses livrées en moins de 4 h moyennant des frais supplémentaires.',
    },
    {
      question: 'Qu\'est-ce qui différencie vos réponses d\'appels d\'offres ?',
      answer: 'Nos réponses sont élaborées par des chargés d\'affaires expérimentés qui comprennent à la fois le processus de marchés publics et votre secteur spécifique. Chaque réponse est adaptée à votre entreprise et optimisée pour les exigences spécifiques de l\'appel d\'offres.',
    },
    {
      question: 'Puis-je personnaliser les réponses d\'appels d\'offres ?',
      answer: 'Absolument ! Toutes les réponses sont entièrement personnalisables. Vous pouvez réviser, modifier et approuver chaque réponse avant soumission. Nous créons également des modèles personnalisés basés sur vos préférences et vos offres passées réussies.',
    },
    {
      question: 'Que faire si j\'ai besoin d\'aide avec le processus de soumission d\'appel d\'offres ?',
      answer: 'Notre équipe vous accompagne intégralement tout au long du processus, de la découverte initiale de l\'appel d\'offres à la soumission finale. Vous bénéficiez d\'un chargé d\'affaires référent dédié à votre entreprise pour un accompagnement personnalisé.',
    },
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section ref={sectionRef} className="section-padding bg-white">
      <div className="container-max">
        <div className={`text-center mb-16 transition-all duration-800 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
          <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-6">
            Questions fréquemment posées
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Tout ce que vous devez savoir sur Tendrix
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className={`border border-border rounded-2xl mb-4 overflow-hidden transition-all duration-600 ${
                isVisible ? 'animate-fade-in-up' : 'opacity-0 translate-y-4'
              }`}
              style={{ animationDelay: `${0.1 + index * 0.1}s` }}
            >
              <button
                className="w-full p-6 text-left flex items-center justify-between hover:bg-muted/50 transition-colors duration-200"
                onClick={() => toggleFAQ(index)}
              >
                <h3 className="text-lg font-semibold text-foreground pr-4">
                  {faq.question}
                </h3>
                {openIndex === index ? (
                  <Minus className="h-5 w-5 text-primary flex-shrink-0" />
                ) : (
                  <Plus className="h-5 w-5 text-primary flex-shrink-0" />
                )}
              </button>
              
              {openIndex === index && (
                <div className="px-6 pb-6 border-t border-border animate-accordion-down">
                  <p className="text-muted-foreground leading-relaxed pt-4">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;