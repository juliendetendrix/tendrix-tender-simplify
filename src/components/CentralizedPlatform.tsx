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

        <div className={`grid lg:grid-cols-2 gap-12 items-center ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.3s' }}>
          {/* Left Content */}
          <div className="space-y-8">
            <div className="bg-card/50 backdrop-blur border border-border rounded-2xl p-6 hover:shadow-medium transition-all duration-300">
              <h3 className="text-xl font-semibold text-foreground mb-3">
                Unified Dashboard
              </h3>
              <p className="text-muted-foreground">
                View all available tender opportunities in one centralized location, with advanced filtering and search capabilities to find exactly what matches your business.
              </p>
            </div>

            <div className="bg-card/50 backdrop-blur border border-border rounded-2xl p-6 hover:shadow-medium transition-all duration-300">
              <h3 className="text-xl font-semibold text-foreground mb-3">
                Real-time Updates
              </h3>
              <p className="text-muted-foreground">
                Stay informed with instant notifications about new opportunities, deadline reminders, and status updates directly on your mobile device.
              </p>
            </div>

            <div className="bg-card/50 backdrop-blur border border-border rounded-2xl p-6 hover:shadow-medium transition-all duration-300">
              <h3 className="text-xl font-semibold text-foreground mb-3">
                Mobile Accessibility
              </h3>
              <p className="text-muted-foreground">
                Access your tender opportunities anywhere, anytime. Our mobile-optimized platform ensures you never miss an important deadline or opportunity.
              </p>
            </div>
          </div>

          {/* Right Content - Mobile Mockup */}
          <div className={`relative ${isVisible ? 'animate-slide-in-right' : 'opacity-0 translate-x-16'}`} style={{ animationDelay: '0.6s' }}>
            <div className="relative bg-gradient-to-br from-primary/10 to-secondary/10 rounded-3xl p-8 shadow-strong">
              <img 
                src={mobileMockup} 
                alt="Tendrix mobile application interface showing centralized tender management" 
                className="w-full max-w-sm mx-auto drop-shadow-2xl hover:scale-105 transition-transform duration-300"
              />
              
              {/* Floating elements for visual appeal */}
              <div className="absolute -top-4 -right-4 w-8 h-8 bg-primary/20 rounded-full blur-md"></div>
              <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-secondary/20 rounded-full blur-lg"></div>
              <div className="absolute top-1/2 -left-2 w-6 h-6 bg-accent/30 rounded-lg blur-sm"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CentralizedPlatform;