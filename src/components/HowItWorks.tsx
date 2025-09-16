import dashboardMockup from '@/assets/dashboard-mockup.jpg';
import franceNetworkMap from '@/assets/france-network-new.png';
import notificationIllustration from '@/assets/notification-illustration.png';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

const HowItWorks = () => {
  const { ref: titleRef, isVisible: titleVisible } = useScrollAnimation();
  const { ref: block1Ref, isVisible: v1 } = useScrollAnimation();
  const { ref: block2Ref, isVisible: v2 } = useScrollAnimation();
  const { ref: block3Ref, isVisible: v3 } = useScrollAnimation();
  const { ref: ctaRef, isVisible: vCta } = useScrollAnimation();
  return (
    <section id="how-it-works" className="section-padding bg-primary relative z-40 overflow-visible">
      {/* Floating Title - positioned to straddle sections */}
      <div ref={titleRef} className="absolute -top-8 left-0 right-0 z-30 flex justify-center">
        <div className={`bg-white/95 backdrop-blur-md border border-border rounded-3xl px-8 py-4 shadow-medium mx-4 z-50 transition-all duration-800 ${
          titleVisible ? 'animate-fade-in-up' : 'opacity-0 translate-y-4'
        }`}>
          <h2 className="text-xl lg:text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent text-center">
            Unlock an untapped market
          </h2>
        </div>
      </div>

      <div className="container-max relative z-10 pt-12">{/* Reduced padding-top */}

        {/* First Block: Respond to tenders under 4 hours */}
        <div ref={block1Ref} className={`bg-card/90 backdrop-blur border border-white/20 rounded-3xl p-6 shadow-strong mb-6 ${
          v1 ? 'animate-slide-in-left' : 'opacity-0 -translate-x-16'
        }`}>
          <div className="grid lg:grid-cols-2 gap-6 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left order-1">
              <h3 className="text-2xl lg:text-3xl font-bold text-foreground mb-4">
                Respond to a tender in under 4 hours
              </h3>
              <p className="text-base text-muted-foreground leading-relaxed">
                Thanks to the Tendrix winning deck and our extensive knowledge and close proximity to our clients, 
                we optimize and streamline all administrative paperwork to respond to certain tenders in less than 4 hours.
              </p>
            </div>

            {/* Right Content - Software Image */}
            <div className="relative order-2">
              <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-3 shadow-medium hover:scale-105 transition-transform duration-300 h-64 lg:h-80 flex items-center justify-center">
                <img 
                  src={dashboardMockup} 
                  alt="Tendrix Dashboard Software Interface" 
                  className="w-full h-full object-cover rounded-xl"
                />
              </div>
              
              {/* Floating elements for visual appeal */}
              <div className="absolute -top-2 -right-2 w-4 h-4 bg-primary/40 rounded-lg blur-sm"></div>
              <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-accent/30 rounded-xl blur-sm"></div>
            </div>
          </div>
        </div>

        {/* Second Block: Network of certified business managers */}
        <div ref={block2Ref} className={`bg-card/90 backdrop-blur border border-white/20 rounded-3xl p-6 shadow-strong mb-6 ${
          v2 ? 'animate-slide-in-right' : 'opacity-0 translate-x-16'
        }`} style={{animationDelay: '0.3s'}}>
          <div className="grid lg:grid-cols-2 gap-6 items-center">
            {/* Text Content - Mobile First */}
            <div className="text-center lg:text-left order-1 lg:order-2">
              <h3 className="text-2xl lg:text-3xl font-bold text-foreground mb-4">
                A certified business development network
              </h3>
              <p className="text-base text-muted-foreground leading-relaxed">
                Our extensive network of certified business managers across France ensures local expertise and personalized support for your tender applications, providing you with regional insights and dedicated assistance.
              </p>
            </div>

            {/* Left Content - France Network Image */}
            <div className="relative order-2 lg:order-1">
              <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-3 shadow-medium hover:scale-105 transition-transform duration-300 h-64 lg:h-80 flex items-center justify-center">
                <img 
                  src={franceNetworkMap} 
                  alt="Carte de France avec réseau connecté montrant la couverture nationale des managers certifiés" 
                  className="w-full h-full object-contain rounded-xl"
                />
              </div>
              
              {/* Floating elements for visual appeal */}
              <div className="absolute -top-2 -left-2 w-4 h-4 bg-accent/40 rounded-lg blur-sm"></div>
              <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-primary/30 rounded-xl blur-sm"></div>
            </div>
          </div>
        </div>

        {/* Third Block: Instant request triggering */}
        <div ref={block3Ref} className={`bg-card/90 backdrop-blur border border-white/20 rounded-3xl p-6 shadow-strong mb-6 ${
          v3 ? 'animate-slide-in-left' : 'opacity-0 -translate-x-16'
        }`} style={{animationDelay: '0.6s'}}>
          <div className="grid lg:grid-cols-2 gap-6 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left order-1">
              <h3 className="text-2xl lg:text-3xl font-bold text-foreground mb-4">
                Trigger your request instantly
              </h3>
              <p className="text-base text-muted-foreground leading-relaxed">
                Get notified immediately when new tender opportunities match your business profile. Our intelligent system ensures you never miss a relevant opportunity with real-time alerts delivered directly to your device.
              </p>
            </div>

            {/* Right Content - Notification Image */}
            <div className="relative order-2">
              <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-3 shadow-medium hover:scale-105 transition-transform duration-300 h-64 lg:h-80 flex items-center justify-center">
                <img 
                  src={notificationIllustration} 
                  alt="Professional receiving Tendrix notification about new tender opportunity for energy renovation of public buildings" 
                  className="w-full h-full object-cover object-bottom rounded-xl"
                />
              </div>
              
              {/* Floating elements for visual appeal */}
              <div className="absolute -top-2 -right-2 w-4 h-4 bg-primary/40 rounded-lg blur-sm"></div>
              <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-accent/30 rounded-xl blur-sm"></div>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <div ref={ctaRef} className="text-center mt-12">
          <button className={`btn-secondary ${
            vCta ? 'animate-bounce-in' : 'opacity-0 translate-y-8'
          }`} style={{animationDelay: '1.2s'}}>
            Start your first rapid response
          </button>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;