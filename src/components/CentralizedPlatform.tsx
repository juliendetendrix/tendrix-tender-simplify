import mobileMockup from '@/assets/mobile-mockup-new.png';
import tendrixDashboard from '@/assets/tendrix-dashboard-illustration.png';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

const CentralizedPlatform = () => {
  const { ref: sectionRef, isVisible } = useScrollAnimation();
  
  return (
    <section ref={sectionRef} className="section-padding bg-background">
      <div className="container-max">
        {/* Centered Title */}
        <div className={`text-center mb-16 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
          <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-6 max-w-4xl mx-auto">
            Tous les appels d'offres, centralisés sur une même plateforme
          </h2>
        </div>

        {/* Two images side by side */}
        <div className={`grid lg:grid-cols-2 gap-12 items-center ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.3s' }}>
          
          {/* Platform Interface with Map */}
          <div className={`${isVisible ? 'animate-slide-in-left' : 'opacity-0 -translate-x-16'}`} style={{ animationDelay: '0.5s' }}>
            <img 
              src={tendrixDashboard} 
              alt="Interface complète de la plateforme Tendrix avec sidebar de navigation à gauche et carte interactive des appels d'offres à droite" 
              className="w-full rounded-xl shadow-medium hover:scale-105 transition-transform duration-300"
            />
          </div>

          {/* Right - Mobile Mockup */}
          <div className={`flex justify-center ${isVisible ? 'animate-slide-in-right' : 'opacity-0 translate-x-16'}`} style={{ animationDelay: '0.7s' }}>
            <img 
              src={mobileMockup} 
              alt="Application mobile Tendrix montrant l'interface de gestion centralisée des appels d'offres" 
              className="w-full max-w-sm drop-shadow-2xl hover:scale-105 transition-transform duration-300"
            />
          </div>

        </div>
      </div>
    </section>
  );
};

export default CentralizedPlatform;