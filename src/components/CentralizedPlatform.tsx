import mobileMockup from '@/assets/mobile-mockup.png';
import ParisMap from './ParisMap';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

const CentralizedPlatform = () => {
  const { ref: sectionRef, isVisible } = useScrollAnimation();
  
  return (
    <section ref={sectionRef} className="section-padding bg-background">
      <div className="container-max">
        <div className={`grid lg:grid-cols-2 gap-12 items-center ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
          {/* Left Content - Title and Description */}
          <div className="text-center lg:text-left">
            <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-6">
              All tender opportunities centralized in one application
            </h2>
            <p className="text-xl text-muted-foreground">
              Access, manage, and respond to all tender opportunities from a single, powerful platform designed for efficiency and success.
            </p>
          </div>

          {/* Right Content - Mobile Mockup and Map */}
          <div className={`space-y-8 ${isVisible ? 'animate-slide-in-right' : 'opacity-0 translate-x-16'}`} style={{ animationDelay: '0.3s' }}>
            {/* Mobile Mockup */}
            <div className="flex justify-center lg:justify-end">
              <img 
                src={mobileMockup} 
                alt="Tendrix mobile application interface showing centralized tender management" 
                className="w-full max-w-sm drop-shadow-2xl hover:scale-105 transition-transform duration-300"
              />
            </div>
            
            {/* Paris Map */}
            <ParisMap />
          </div>
        </div>
      </div>
    </section>
  );
};

export default CentralizedPlatform;