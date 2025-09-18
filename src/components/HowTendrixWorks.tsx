import { Search, MousePointer, TrendingUp } from 'lucide-react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

const HowTendrixWorks = () => {
  const { ref, isVisible } = useScrollAnimation();

  const steps = [
    {
      icon: Search,
      title: "Recevez des opportunités",
      description: "Tendrix centralise et vous envois tous les appels d'offres pertinents pour votre entreprise."
    },
    {
      icon: MousePointer, 
      title: "Demandez une réponse",
      description: "En un clic, déléguez la réponse à nos experts métiers."
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
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              De la découverte aux résultats, nous simplifions tout le processus.
            </p>
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
                      <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
                        <IconComponent className="h-8 w-8 text-primary" />
                      </div>
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
                    <div className="hidden md:block absolute top-1/2 -right-6 lg:-right-8 transform -translate-y-1/2 z-10 text-center">
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
                      {index === 0 && (
                        <div className="bg-[#ff6b35] text-white px-1.5 py-0.5 rounded text-[10px] font-medium mt-1 whitespace-nowrap">
                          Cliquez sur la notification
                        </div>
                      )}
                       {index === 1 && (
                         <div className="inline-flex items-center justify-center w-8 h-8 bg-orange-500 rounded-full text-xs font-bold text-white mt-1">
                           -4h
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