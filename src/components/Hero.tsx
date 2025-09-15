import dashboardMockup from '@/assets/dashboard-mockup.jpg';
import tendrixBrandingBar from '@/assets/tendrix-branding-bar.png';

const Hero = () => {
  return (
    <section className="pt-24 pb-16 lg:pt-32 lg:pb-24 bg-gradient-hero">
      <div className="container-max">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
              Tenders, finally{' '}
              <span className="gradient-text">simplified</span>{' '}
              and answered in one click.
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-xl mx-auto lg:mx-0">
              Tendrix helps SMEs discover the right tenders and request a response instantly.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button className="btn-primary text-lg px-8 py-4">
                Discover tenders for your business
              </button>
              <button className="btn-outline text-lg px-8 py-4">
                Join the private beta
              </button>
            </div>
          </div>

          {/* Right Content - Mockup */}
          <div className="relative">
            {/* Tendrix Branding Bar - Behind dashboard */}
            <div className="absolute -top-8 -right-12 w-64 h-32 opacity-60 z-0">
              <img
                src={tendrixBrandingBar}
                alt=""
                className="w-full h-full object-contain"
              />
            </div>
            
            <div className="relative z-10">
              <img
                src={dashboardMockup}
                alt="Tendrix dashboard preview showing tender management interface"
                className="w-full h-auto rounded-2xl shadow-strong"
              />
            </div>
            
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-primary opacity-20 rounded-2xl blur-3xl transform scale-110"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;