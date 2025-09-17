import franceNetworkMap from '@/assets/france-network-new.png';
import notificationIllustration from '@/assets/notification-illustration.png';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

const RemainingBlocks = () => {
  const { ref: block2Ref, isVisible: v2 } = useScrollAnimation();
  const { ref: block3Ref, isVisible: v3 } = useScrollAnimation();
  const { ref: ctaRef, isVisible: vCta } = useScrollAnimation();

  return (
    <section className="section-padding bg-primary relative z-40">
      <div className="container-max relative z-10">
        {/* Second Block: Network of certified business managers */}
        <div ref={block2Ref} className={`bg-card/90 backdrop-blur border border-white/20 rounded-3xl p-6 shadow-strong mb-6 transition-all duration-800 ${
          v2 ? 'animate-slide-in-right' : 'opacity-0 translate-x-16'
        }`}>
          <div className="grid lg:grid-cols-2 gap-6 items-center">
            {/* Text Content - Mobile First */}
            <div className="text-center lg:text-left order-1 lg:order-2">
              <h3 className="text-2xl lg:text-3xl font-bold text-foreground mb-4">
                Un réseau de développement commercial certifié
              </h3>
              <p className="text-base text-muted-foreground leading-relaxed">
                Notre vaste réseau de managers commerciaux certifiés à travers la France garantit une expertise locale et un accompagnement personnalisé pour vos candidatures d'appels d'offres, vous offrant des insights régionaux et une assistance dédiée.
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
        <div ref={block3Ref} className={`bg-card/90 backdrop-blur border border-white/20 rounded-3xl p-6 shadow-strong mb-6 transition-all duration-800 ${
          v3 ? 'animate-slide-in-left' : 'opacity-0 -translate-x-16'
        }`}>
          <div className="grid lg:grid-cols-2 gap-6 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left order-1">
              <h3 className="text-2xl lg:text-3xl font-bold text-foreground mb-4">
                Déclenchez votre demande instantanément
              </h3>
              <p className="text-base text-muted-foreground leading-relaxed">
                Soyez notifié immédiatement lorsque de nouvelles opportunités d'appels d'offres correspondent à votre profil d'entreprise. Notre système intelligent vous assure de ne jamais manquer une opportunité pertinente avec des alertes en temps réel livrées directement sur votre appareil.
              </p>
            </div>

            {/* Right Content - Notification Image */}
            <div className="relative order-2">
              <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-3 shadow-medium hover:scale-105 transition-transform duration-300 h-64 lg:h-80 flex items-center justify-center">
                <img 
                  src={notificationIllustration} 
                  alt="Professionnel recevant une notification Tendrix sur une nouvelle opportunité d'appel d'offres pour la rénovation énergétique des bâtiments publics" 
                  className="w-full h-full object-cover rounded-xl"
                  style={{ objectPosition: '50% 80%' }}
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
          <button className={`btn-secondary transition-all duration-800 ${
            vCta ? 'animate-bounce-in' : 'opacity-0 translate-y-8'
          }`}>
            Commencer votre première réponse rapide
          </button>
        </div>
      </div>
    </section>
  );
};

export default RemainingBlocks;