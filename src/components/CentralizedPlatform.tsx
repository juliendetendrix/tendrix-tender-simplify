import mobileMockup from '@/assets/mobile-mockup.png';
import ParisMap from './ParisMap';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

const CentralizedPlatform = () => {
  const { ref: sectionRef, isVisible } = useScrollAnimation();
  
  return (
    <section ref={sectionRef} className="section-padding bg-background">
      <div className="container-max">
        {/* Centered Title */}
        <div className={`text-center mb-20 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
          <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-6 max-w-4xl mx-auto">
            All tender opportunities centralized in one application
          </h2>
        </div>

        {/* Two-column layout inspired by the reference */}
        <div className={`grid lg:grid-cols-2 gap-16 items-start ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.3s' }}>
          
          {/* Left Section - Interactive Map */}
          <div className={`text-center ${isVisible ? 'animate-slide-in-left' : 'opacity-0 -translate-x-16'}`} style={{ animationDelay: '0.5s' }}>
            <div className="relative mb-8">
              <ParisMap />
            </div>
            <h3 className="text-xl lg:text-2xl font-semibold text-foreground mb-3">
              Discover opportunities around you
            </h3>
            <p className="text-muted-foreground">
              Visualize tender opportunities in your region and optimize your business development strategy.
            </p>
          </div>

          {/* Right Section - Mobile App */}
          <div className={`text-center ${isVisible ? 'animate-slide-in-right' : 'opacity-0 translate-x-16'}`} style={{ animationDelay: '0.7s' }}>
            <div className="relative mb-8 flex justify-center">
              <img 
                src={mobileMockup} 
                alt="Tendrix mobile application interface showing centralized tender management" 
                className="w-full max-w-sm drop-shadow-2xl hover:scale-105 transition-transform duration-300"
              />
            </div>
            <h3 className="text-xl lg:text-2xl font-semibold text-foreground mb-3">
              And manage everything from your phone
            </h3>
            <p className="text-muted-foreground">
              Access, track, and respond to tender opportunities anywhere, anytime with our mobile-first platform.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
};

export default CentralizedPlatform;