import { Bell, MessageSquare, TrendingUp, Hand } from 'lucide-react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

const HowTendrixWorks = () => {
  const { ref, isVisible } = useScrollAnimation();

  const steps = [
    {
      icon: Bell,
      title: "Recevez des opportunités",
      description: "Tendrix centralise et vous envois tous les appels d'offres pertinents pour votre entreprise."
    },
    {
      icon: () => (
        <div className="relative">
          <div className="bg-primary/10 px-4 py-2 rounded-xl text-primary text-[11px] font-semibold font-mono tracking-wide">
            Demander une réponse
          </div>
          {/* Effet de clic avec icône main */}
          <div className="absolute bottom-0 left-0 transform translate-x-1 translate-y-1">
            <Hand className="w-3 h-3 text-primary/70" />
          </div>
        </div>
      ),
      title: "Demandez une réponse",
      description: "Prenez connaissance du résumé de l'appel d'offre, Prix, Localisation, Budget, Livrable... Et demandez ou non d'entamer la réponse à l'Appel d'offre"
    },
    {
      icon: TrendingUp,
      title: "Remportez plus de marchés",
      description: "Obtenez des réponses professionnelles qui augmentent vos chances de succès."
    }
  ];

  return (
    <section className="section-padding bg-background relative z-30">
      <div className="container-max">
        <div ref={ref} className={`transition-all duration-800 ${
          isVisible ? 'animate-fade-in-up' : 'opacity-0 translate-y-8'
        }`}>
          
          {/* Header */}
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-6">
              Comment fonctionne Tendrix en 3 étapes simples
            </h2>
          </div>
          
          {/* Process Steps */}
          <div className="grid md:grid-cols-3 gap-8 lg:gap-12 items-center max-w-5xl mx-auto">
            {steps.map((step, index) => {
              const IconComponent = step.icon;
              return (
                <div key={index} className="relative">
                  {/* Step Card */}
                  <div className={`bg-card border border-border rounded-2xl p-8 text-center shadow-soft hover:shadow-medium transition-all duration-300 hover:-translate-y-1 ${
                    isVisible ? 'animate-fade-in-up' : 'opacity-0 translate-y-8'
                  }`} style={{ animationDelay: `${index * 0.2}s` }}>
                    
                    {/* Icon */}
                    <div className="mb-6 flex justify-center">
                      {index === 1 ? (
                        <IconComponent />
                      ) : (
                        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
                          <IconComponent className="h-8 w-8 text-primary" />
                        </div>
                      )}
                    </div>
                    
                    {/* Step Number */}
                    <div className="text-sm font-semibold text-primary mb-2">
                      Étape {index + 1}
                    </div>
                    
                    {/* Title */}
                    <h3 className="text-xl font-bold text-foreground mb-4">
                      {step.title}
                    </h3>
                    
                    {/* Description */}
                    <p className="text-muted-foreground">
                      {step.description}
                    </p>
                  </div>

                  {/* Arrow (hidden on last step and mobile) */}
                  {index < steps.length - 1 && (
                    <div className="hidden md:block absolute top-1/2 -right-6 lg:-right-8 transform -translate-y-1/2 z-10">
                      <div className="text-center">
                        <svg 
                          className="w-8 h-8 text-primary/60 mx-auto" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M17 8l4 4m0 0l-4 4m4-4H3" 
                          />
                        </svg>
                      </div>
                      
                      {index === 0 && (
                        <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2">
                          <div className="bg-muted/80 text-muted-foreground px-2 py-1 rounded-md text-[10px] font-medium shadow-sm border text-center">
                            Cliquez sur la<br />notification
                          </div>
                        </div>
                      )}
                       
                      {index === 1 && (
                        <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2">
                          <div className="bg-muted/80 text-muted-foreground px-2 py-1 rounded-full text-[11px] font-medium border shadow-sm">
                            -4h
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Mobile Arrow (vertical) */}
                  {index < steps.length - 1 && (
                    <div className="md:hidden flex justify-center mt-8 mb-2">
                      <svg 
                        className="w-6 h-6 text-primary/60" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M19 14l-7 7m0 0l-7-7m7 7V3" 
                        />
                      </svg>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
};

export default HowTendrixWorks;