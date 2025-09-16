import mobileMockup from '@/assets/mobile-mockup.png';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

const CentralizedPlatform = () => {
  const { ref: sectionRef, isVisible } = useScrollAnimation();
  
  return (
    <section ref={sectionRef} className="section-padding bg-background">
      <div className="container-max">
        <div className={`text-center mb-16 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
          <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-6">
            All tender opportunities centralized in one application
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Access, manage, and respond to all tender opportunities from a single, powerful platform designed for efficiency and success.
          </p>
        </div>

        <div className={`flex justify-center ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.3s' }}>
          {/* Mobile Mockup - No Frame */}
          <div className={`relative ${isVisible ? 'animate-scale-in' : 'opacity-0'}`} style={{ animationDelay: '0.6s' }}>
            <img 
              src={mobileMockup} 
              alt="Tendrix mobile application interface showing centralized tender management" 
              className="w-full max-w-md mx-auto drop-shadow-2xl hover:scale-105 transition-transform duration-300"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default CentralizedPlatform;