import dashboardMockup from '@/assets/dashboard-mockup.jpg';

const Hero = () => {
  return (
    <section className="relative pt-24 pb-16 lg:pt-32 lg:pb-24 bg-background overflow-hidden">
      {/* Organic Background Shapes */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-96 h-96 bg-primary rounded-full blur-3xl"></div>
        <div className="absolute top-40 right-20 w-80 h-80 bg-accent rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-1/3 w-64 h-64 bg-secondary rounded-full blur-3xl"></div>
        <div className="absolute top-10 right-1/3 w-48 h-48 bg-primary/50 rounded-full blur-2xl"></div>
      </div>

      <div className="container-max relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
            Tenders, finally{' '}
            <span className="gradient-text">simplified</span>{' '}
            and answered in one click.
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Tendrix helps SMEs discover the right tenders and request a response instantly.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <button className="btn-primary text-lg px-8 py-4">
              Discover tenders for your business
            </button>
            <button className="btn-outline text-lg px-8 py-4">
              Join the private beta
            </button>
          </div>

          {/* Dashboard Preview */}
          <div className="relative max-w-4xl mx-auto">
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