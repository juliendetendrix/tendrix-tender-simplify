import dashboardExactScreenshot from '@/assets/dashboard-exact-screenshot.jpg';
import { useBetaQuestionnaire } from '@/hooks/useBetaQuestionnaire';

const Hero = () => {
  const { openQuestionnaire } = useBetaQuestionnaire();

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
        {/* Subtle background shape */}
        <div className="absolute inset-0 bg-muted/30 rounded-[3rem] -mx-8 -my-8 blur-[1px]"></div>
        <div className="text-center max-w-4xl mx-auto relative z-10">
          <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-6 leading-tight animate-fade-in" style={{animationDelay: '0.2s'}}>
            Les appels d'offres, enfin{' '}
            <span className="gradient-text">simplifiés</span>{' '}
            et traités en un clic.
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-fade-in" style={{animationDelay: '0.4s'}}>
            Recevez les appels d'offres qui vous correspondent et déclenchez une réponse en quelques secondes.
          </p>

          <div className="flex justify-center mb-12 animate-fade-in" style={{animationDelay: '0.6s'}}>
            <button 
              className="btn-primary text-lg px-8 py-4"
              onClick={openQuestionnaire}
            >
              Découvrez les marchés qui correspondent à votre savoir-faire
            </button>
          </div>

          {/* Dashboard Preview */}
          <div className="relative max-w-5xl mx-auto mt-16 animate-slide-in-right" style={{animationDelay: '0.8s'}}>
            {/* Main container with sophisticated border */}
            <div className="relative bg-card/50 backdrop-blur-sm border border-border/50 rounded-3xl p-8 shadow-strong">
              {/* Inner frame for the dashboard image */}
              <div className="relative bg-white rounded-2xl p-4 shadow-medium">
                <img
                  src={dashboardExactScreenshot}
                  alt="Capture d'écran du tableau de bord Tendrix avec tous les éléments visibles"
                  className="w-full h-auto rounded-xl shadow-soft"
                />
              </div>
              
              {/* Decorative elements around the frame */}
              <div className="absolute -top-4 -left-4 w-24 h-24 bg-primary/20 rounded-2xl blur-2xl"></div>
              <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-accent/20 rounded-3xl blur-3xl"></div>
              <div className="absolute top-1/2 -right-6 w-16 h-16 bg-secondary/30 rounded-full blur-xl"></div>
            </div>
            
            {/* Background gradient glow */}
            <div className="absolute inset-0 bg-gradient-primary opacity-10 rounded-3xl blur-3xl transform scale-110 -z-10"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;