import dashboardMockup from '@/assets/dashboard-mockup.jpg';
import franceNetwork from '@/assets/france-network.jpg';
import notificationMockup from '@/assets/notification-mockup.jpg';

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="section-padding bg-primary relative overflow-hidden">
      <div className="container-max relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-5xl font-bold text-primary-foreground mb-6">
            Unlock an untapped market
          </h2>
        </div>

        {/* First Block: Respond to tenders under 4 hours */}
        <div className="bg-card/90 backdrop-blur border border-white/20 rounded-3xl p-8 shadow-strong mb-8">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left">
              <h3 className="text-2xl lg:text-3xl font-bold text-foreground mb-4">
                Respond to a tender in under 4 hours
              </h3>
              <p className="text-base text-muted-foreground leading-relaxed">
                Thanks to the Tendrix winning deck and our extensive knowledge and close proximity to our clients, 
                we optimize and streamline all administrative paperwork to respond to certain tenders in less than 4 hours.
              </p>
            </div>

            {/* Right Content - Software Image */}
            <div className="relative">
              <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-3 shadow-medium">
                <img 
                  src={dashboardMockup} 
                  alt="Tendrix Dashboard Software Interface" 
                  className="w-full h-auto rounded-xl"
                />
              </div>
              
              {/* Floating elements for visual appeal */}
              <div className="absolute -top-2 -right-2 w-4 h-4 bg-primary/40 rounded-lg blur-sm"></div>
              <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-accent/30 rounded-xl blur-sm"></div>
            </div>
          </div>
        </div>

        {/* Second Block: Network of certified business managers */}
        <div className="bg-card/90 backdrop-blur border border-white/20 rounded-3xl p-8 shadow-strong mb-8">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            {/* Left Content - France Network Image */}
            <div className="relative">
              <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-3 shadow-medium">
                <img 
                  src={franceNetwork} 
                  alt="France business network map showing certified managers" 
                  className="w-full h-auto rounded-xl"
                />
              </div>
              
              {/* Floating elements for visual appeal */}
              <div className="absolute -top-2 -left-2 w-4 h-4 bg-accent/40 rounded-lg blur-sm"></div>
              <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-primary/30 rounded-xl blur-sm"></div>
            </div>

            {/* Right Content */}
            <div className="text-center lg:text-left">
              <h3 className="text-2xl lg:text-3xl font-bold text-foreground mb-4">
                A certified business development network
              </h3>
              <p className="text-base text-muted-foreground leading-relaxed">
                Our extensive network of certified business managers across France ensures local expertise and personalized support for your tender applications, providing you with regional insights and dedicated assistance.
              </p>
            </div>
          </div>
        </div>

        {/* Third Block: Instant request triggering */}
        <div className="bg-card/90 backdrop-blur border border-white/20 rounded-3xl p-8 shadow-strong mb-8">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left">
              <h3 className="text-2xl lg:text-3xl font-bold text-foreground mb-4">
                Trigger your request instantly
              </h3>
              <p className="text-base text-muted-foreground leading-relaxed">
                Get notified immediately when new tender opportunities match your business profile. Our intelligent system ensures you never miss a relevant opportunity with real-time alerts delivered directly to your device.
              </p>
            </div>

            {/* Right Content - Notification Image */}
            <div className="relative">
              <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-3 shadow-medium">
                <img 
                  src={notificationMockup} 
                  alt="Business professional receiving Tendrix notification on mobile device" 
                  className="w-full h-auto rounded-xl"
                />
              </div>
              
              {/* Floating elements for visual appeal */}
              <div className="absolute -top-2 -right-2 w-4 h-4 bg-primary/40 rounded-lg blur-sm"></div>
              <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-accent/30 rounded-xl blur-sm"></div>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <div className="text-center mt-12">
          <button className="btn-secondary">
            Start your first rapid response
          </button>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;