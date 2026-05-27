import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { Search, FileText, Award } from 'lucide-react';

const pillars = [
  {
    icon: Search,
    stat: '+350 000',
    statLabel: 'avis publiés par an sur le BOAMP',
    title: 'On vous trouve des marchés recommandés',
    description:
      'Tendrix surveille le BOAMP et les plateformes complémentaires en temps réel. Seuls les appels d\'offres correspondant à votre métier, votre zone et votre capacité sont remontés — classés par score de compatibilité.',
  },
  {
    icon: FileText,
    stat: '15 sec',
    statLabel: 'pour décider si un AO vous correspond',
    title: 'Vous analysez en un temps record',
    description:
      'Chaque appel d\'offres est automatiquement résumé par notre IA : ce que l\'acheteur recherche, les critères d\'attribution, les montants estimés, les dates clés. Tout ce qu\'il vous faut pour décider en 15 secondes, sans lire 200 pages.',
  },
  {
    icon: Award,
    stat: '90 %',
    statLabel: 'des marchés publics centralisés sur notre plateforme',
    title: 'Nos experts préparent votre réponse',
    description:
      'Une fois votre décision prise, nos experts certifiés marchés publics rédigent votre dossier de réponse complet. Arguments de vente, conformité administrative, structure gagnante — vous validez et envoyez.',
  },
];

const PainPoint = () => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section className="section-padding bg-muted/30">
      <div className="container-max">
        <div
          ref={ref}
          className={`text-center mb-14 transition-all duration-700 ${
            isVisible ? 'animate-fade-in-up' : 'opacity-0 translate-y-6'
          }`}
        >
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            De la détection à la réponse gagnante
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Concentrez-vous sur votre métier. Nous nous occupons du reste.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {pillars.map((pillar, i) => {
            const Icon = pillar.icon;
            return (
              <div
                key={i}
                className="bg-white border border-border rounded-xl p-7 hover:shadow-medium transition-shadow duration-300 flex flex-col"
              >
                {/* Icon */}
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-5">
                  <Icon className="w-5 h-5 text-primary" />
                </div>

                {/* Stat */}
                <div className="mb-4 pb-4 border-b border-border">
                  <div className="text-3xl font-black text-primary leading-none mb-0.5">
                    {pillar.stat}
                  </div>
                  <div className="text-xs text-muted-foreground">{pillar.statLabel}</div>
                </div>

                {/* Content */}
                <h3 className="text-base font-semibold text-foreground mb-3">{pillar.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed flex-1">{pillar.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default PainPoint;
