import tenderResponseIllustration from '@/assets/tender-response-illustration.png';
import franceNetworkMap from '@/assets/france-network-new-v3.png';
import notificationIllustration from '@/assets/notification-illustration.png';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { useBetaQuestionnaire } from '@/hooks/useBetaQuestionnaire';

const HowItWorks = () => {
  const { ref: titleRef, isVisible: titleVisible } = useScrollAnimation();
  const { ref: block1Ref, isVisible: v1 } = useScrollAnimation();
  const { ref: block2Ref, isVisible: v2 } = useScrollAnimation();
  const { ref: block3Ref, isVisible: v3 } = useScrollAnimation();
  const { ref: ctaRef, isVisible: vCta } = useScrollAnimation();
  const { openQuestionnaire } = useBetaQuestionnaire();
  return (
    <section id="how-it-works" className="section-padding bg-primary relative z-40 overflow-visible">
      {/* Floating Title - positioned to straddle sections */}
      <div ref={titleRef} className="absolute -top-8 left-0 right-0 z-30 flex justify-center">
        <div className={`bg-white/95 backdrop-blur-md border border-border rounded-3xl px-8 py-4 shadow-medium mx-4 z-50 transition-all duration-800 ${
          titleVisible ? 'animate-fade-in-up' : 'opacity-0 translate-y-4'
        }`}>
          <h2 className="text-xl lg:text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent text-center">
            Débloquez un marché inexploité
          </h2>
        </div>
      </div>

      <div className="container-max relative z-10 pt-12">{/* Reduced padding-top */}

        {/* First Block: Respond to tenders under 4 hours */}
        <div ref={block1Ref} className={`bg-card/90 backdrop-blur border border-white/20 rounded-3xl p-6 shadow-strong mb-6 transition-all duration-800 ${
          v1 ? 'animate-slide-in-left' : 'opacity-0 -translate-x-16'
        }`}>
          <div className="grid lg:grid-cols-2 gap-6 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left order-1">
              <h3 className="text-2xl lg:text-3xl font-bold text-foreground mb-4">
                Répondre à un appel d'offres en moins de 2 heures
              </h3>
              <p className="text-base text-muted-foreground leading-relaxed">
                Notre IA automatise les tâches administratives et génère la structure de votre réponse en quelques instants. Nos chargés d'affaires certifiés relisent et enrichissent le dossier avec des arguments de vente percutants. Enfin, nous ajoutons le Tendrix Winning Deck, un document exclusif et façonné sur-mesure, qui fait que vos dossiers se démarquent et sortent du lot.
              </p>
            </div>

            {/* Right Content - Software Image */}
            <div className="relative order-2">
              <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-3 shadow-medium hover:scale-105 transition-transform duration-300 h-64 lg:h-80 flex items-center justify-center">
                <img 
                  src={tenderResponseIllustration} 
                  alt="Interface de réponse aux appels d'offres avec progression en temps réel" 
                  className="w-full h-full object-cover rounded-xl transform scale-110"
                />
              </div>
              
              {/* Floating elements for visual appeal */}
              <div className="absolute -top-2 -right-2 w-4 h-4 bg-primary/40 rounded-lg blur-sm"></div>
              <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-accent/30 rounded-xl blur-sm"></div>
            </div>
          </div>
        </div>

        {/* Second Block: Network of certified business managers */}
        <div ref={block2Ref} className={`bg-card/90 backdrop-blur border border-white/20 rounded-3xl p-6 shadow-strong mb-6 transition-all duration-800 ${
          v2 ? 'animate-slide-in-right' : 'opacity-0 translate-x-16'
        }`}>
          <div className="grid lg:grid-cols-2 gap-6 items-center">
            {/* Text Content - Mobile First */}
            <div className="text-center lg:text-left order-1 lg:order-2">
              <h3 className="text-2xl lg:text-3xl font-bold text-foreground mb-4">
                La force d'une solution hybride : IA + humain
              </h3>
              <p className="text-base text-muted-foreground leading-relaxed">
                Une réponse d'appel d'offres ne peut pas être laissée à l'IA seule. Chez Tendrix, l'automatisation assure la vitesse et la rigueur, mais c'est l'expertise humaine qui apporte la stratégie, l'adaptation et la force de persuasion. Cette alliance unique maximise vos chances de succès et garantit des dossiers aussi rapides que convaincants.
              </p>
            </div>

            {/* Left Content - France Network Image */}
            <div className="relative order-2 lg:order-1">
              <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-3 shadow-medium hover:scale-105 transition-transform duration-300 h-64 lg:h-80 flex items-center justify-center">
                <img 
                  src={franceNetworkMap} 
                  alt="Carte de France avec réseau connecté et interface de contact montrant la couverture nationale des managers certifiés" 
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
          <button 
            className={`btn-secondary text-lg px-8 py-4 transform transition duration-500 ${
              vCta ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
            }`}
            onClick={openQuestionnaire}
          >
            Commencer votre première réponse rapide
          </button>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;