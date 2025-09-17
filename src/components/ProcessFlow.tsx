import { useScrollAnimation } from '@/hooks/useScrollAnimation';

const ProcessFlow = () => {
  const { ref, isVisible } = useScrollAnimation();

  const steps = [
    {
      icon: "🔍",
      title: "Recevez vos Appels d'offres personnalisés"
    },
    {
      icon: "📩", 
      title: "Demandez une réponse"
    },
    {
      icon: "🏆",
      title: "Gagnez le marché"
    }
  ];

  return (
    <section className="section-padding bg-background relative z-30">
      <div className="container-max">
        <div ref={ref} className={`transition-all duration-800 ${
          isVisible ? 'animate-fade-in-up' : 'opacity-0 translate-y-8'
        }`}>
          
          {/* Process Steps */}
          <div className="grid md:grid-cols-3 gap-8 lg:gap-12 items-center max-w-5xl mx-auto">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                {/* Step Card */}
                <div className={`bg-card border border-border rounded-2xl p-6 text-center shadow-medium hover:shadow-strong transition-all duration-300 hover:-translate-y-1 ${
                  isVisible ? 'animate-fade-in-up' : 'opacity-0 translate-y-8'
                }`} style={{ animationDelay: `${index * 0.2}s` }}>
                  
                  {/* Icon */}
                  <div className="text-4xl lg:text-5xl mb-4">
                    {step.icon}
                  </div>
                  
                  {/* Title */}
                  <h3 className="text-lg lg:text-xl font-bold text-foreground">
                    {step.title}
                  </h3>
                </div>

                {/* Arrow (hidden on last step and mobile) */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-6 lg:-right-8 transform -translate-y-1/2 z-10">
                    <svg 
                      className="w-6 h-6 lg:w-8 lg:h-8 text-primary" 
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
                )}

                {/* Mobile Arrow (vertical) */}
                {index < steps.length - 1 && (
                  <div className="md:hidden flex justify-center mt-6 mb-2">
                    <svg 
                      className="w-6 h-6 text-primary" 
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
            ))}
          </div>

        </div>
      </div>
    </section>
  );
};

export default ProcessFlow;