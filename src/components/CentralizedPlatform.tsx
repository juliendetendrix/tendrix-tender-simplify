import mobileMockup from '@/assets/mobile-mockup-new.png';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { useBetaQuestionnaire } from '@/hooks/useBetaQuestionnaire';

const CentralizedPlatform = () => {
  const { ref: sectionRef, isVisible } = useScrollAnimation();
  const { openQuestionnaire } = useBetaQuestionnaire();
  
  // Fixed: Removed tendrixDashboard reference and replaced with app download section
  
  return (
    <section ref={sectionRef} className="section-padding bg-background">
      <div className="container-max">
        {/* Centered Title */}
        <div className={`text-center mb-16 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
          <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-6 max-w-4xl mx-auto">
            Tous les appels d'offres, centralisés sur une même plateforme
          </h2>
        </div>

        {/* Two sections side by side */}
        <div className={`grid lg:grid-cols-2 gap-12 items-center ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.3s' }}>
          
          {/* Left - Mobile Mockup */}
          <div className={`flex justify-center ${isVisible ? 'animate-slide-in-left' : 'opacity-0 -translate-x-16'}`} style={{ animationDelay: '0.5s' }}>
            <img 
              src={mobileMockup} 
              alt="Application mobile Tendrix montrant l'interface de gestion centralisée des appels d'offres" 
              className="w-full max-w-sm drop-shadow-2xl hover:scale-105 transition-transform duration-300"
            />
          </div>

          {/* Right - App Download Invitation */}
          <div className={`text-center ${isVisible ? 'animate-slide-in-right' : 'opacity-0 translate-x-16'}`} style={{ animationDelay: '0.7s' }}>
            <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">
              Accédez à tous vos appels d'offres depuis votre smartphone, où que vous soyez.
            </p>
            
            {/* Download Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button 
                onClick={openQuestionnaire}
                className="flex items-center gap-3 bg-black text-white px-6 py-3 rounded-xl hover:bg-gray-800 transition-colors duration-300 shadow-medium"
              >
                <div className="flex flex-col items-start">
                  <span className="text-xs opacity-80">Télécharger sur</span>
                  <span className="text-lg font-semibold">App Store</span>
                </div>
              </button>
              
              <button 
                onClick={openQuestionnaire}
                className="flex items-center gap-3 bg-black text-white px-6 py-3 rounded-xl hover:bg-gray-800 transition-colors duration-300 shadow-medium"
              >
                <div className="flex flex-col items-start">
                  <span className="text-xs opacity-80">Disponible sur</span>
                  <span className="text-lg font-semibold">Google Play</span>
                </div>
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default CentralizedPlatform;