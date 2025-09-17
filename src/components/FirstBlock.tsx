import dashboardMockup from '@/assets/dashboard-mockup.jpg';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

const FirstBlock = () => {
  const { ref: titleRef, isVisible: titleVisible } = useScrollAnimation();
  const { ref: block1Ref, isVisible: v1 } = useScrollAnimation();

  return (
    <section id="how-it-works" className="section-padding bg-primary relative z-40 overflow-visible">
      {/* Floating Title - positioned to straddle sections */}
      <div ref={titleRef} className="absolute -top-8 left-0 right-0 z-30 flex justify-center">
        <div className={`bg-white/95 backdrop-blur-md border border-border rounded-3xl px-8 py-4 shadow-medium mx-4 z-50 transition-all duration-800 ${
          titleVisible ? 'animate-fade-in-up' : 'opacity-0 translate-y-4'
        }`}>
          <h2 className="text-xl lg:text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent text-center">
            Débloquez un marché inexploité
          </h2>
        </div>
      </div>

      <div className="container-max relative z-10 pt-12">
        {/* First Block: Respond to tenders under 4 hours */}
        <div ref={block1Ref} className={`bg-card/90 backdrop-blur border border-white/20 rounded-3xl p-6 shadow-strong mb-6 transition-all duration-800 ${
          v1 ? 'animate-slide-in-left' : 'opacity-0 -translate-x-16'
        }`}>
          <div className="grid lg:grid-cols-2 gap-6 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left order-1">
              <h3 className="text-2xl lg:text-3xl font-bold text-foreground mb-4">
                Répondre à un appel d'offres en moins de 4 heures
              </h3>
              <p className="text-base text-muted-foreground leading-relaxed">
                Grâce au deck gagnant Tendrix et à notre connaissance approfondie et proximité avec nos clients, 
                nous optimisons et rationalisons toute la paperasserie administrative pour répondre à certains appels d'offres en moins de 4 heures.
              </p>
            </div>

            {/* Right Content - Software Image */}
            <div className="relative order-2">
              <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-3 shadow-medium hover:scale-105 transition-transform duration-300 h-64 lg:h-80 flex items-center justify-center">
                <img 
                  src={dashboardMockup} 
                  alt="Interface logicielle du tableau de bord Tendrix" 
                  className="w-full h-full object-cover rounded-xl"
                />
              </div>
              
              {/* Floating elements for visual appeal */}
              <div className="absolute -top-2 -right-2 w-4 h-4 bg-primary/40 rounded-lg blur-sm"></div>
              <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-accent/30 rounded-xl blur-sm"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FirstBlock;