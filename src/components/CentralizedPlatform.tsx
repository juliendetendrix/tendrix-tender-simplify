import mobileMockup from '@/assets/mobile-mockup.png';
import ParisMap from './ParisMap';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

const CentralizedPlatform = () => {
  const { ref: sectionRef, isVisible } = useScrollAnimation();
  
  return (
    <section ref={sectionRef} className="section-padding bg-background">
      <div className="container-max">
        {/* Centered Title */}
        <div className={`text-center mb-16 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
          <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-6 max-w-4xl mx-auto">
            All tender opportunities centralized in one application
          </h2>
        </div>

        {/* Two images side by side */}
        <div className={`grid lg:grid-cols-2 gap-12 items-center ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.3s' }}>
          
          {/* Left - Map */}
          <div className={`${isVisible ? 'animate-slide-in-left' : 'opacity-0 -translate-x-16'}`} style={{ animationDelay: '0.5s' }}>
            <ParisMap />
          </div>

          {/* Right - Mobile Mockup */}
          <div className={`flex justify-center ${isVisible ? 'animate-slide-in-right' : 'opacity-0 translate-x-16'}`} style={{ animationDelay: '0.7s' }}>
            <img 
              src={mobileMockup} 
              alt="Tendrix mobile application interface showing centralized tender management" 
              className="w-full max-w-sm drop-shadow-2xl hover:scale-105 transition-transform duration-300"
            />
          </div>

        </div>
      </div>
    </section>
  );
};

export default CentralizedPlatform;