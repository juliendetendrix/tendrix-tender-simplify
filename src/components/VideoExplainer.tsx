import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { Linkedin } from 'lucide-react';

const VideoExplainer = () => {
  const { ref: sectionRef, isVisible } = useScrollAnimation();

  return (
    <section ref={sectionRef} id="video" className="section-padding bg-primary relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-72 h-72 bg-secondary rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-secondary rounded-full blur-3xl" />
      </div>

      <div className="container-max relative z-10">
        <div className={`text-center mb-12 transition-all duration-800 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
          <h2 className="text-3xl lg:text-5xl font-bold text-primary-foreground mb-6">
            On vous l'explique en vidéo
          </h2>
          <p className="text-xl text-primary-foreground/70 max-w-3xl mx-auto">
            Découvrez Tendrix en quelques secondes
          </p>
        </div>

        <div className={`flex flex-col items-center gap-8 transition-all duration-800 ${isVisible ? 'animate-scale-in' : 'opacity-0 scale-95'}`}>
          {/* Video container */}
          <a
            href="https://www.linkedin.com/posts/julienmalherbe-_cest-lanc%C3%A9-apr%C3%A8s-plusieurs-mois-de-travail-activity-7430506561002745856-OblB?utm_source=share&utm_medium=member_desktop&rcm=ACoAADM_yQcBTeNysd4eLCiYJDW_lR-9HkdWPYo"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative w-full max-w-sm mx-auto rounded-3xl overflow-hidden shadow-strong bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 hover:border-secondary/50 transition-all duration-500 hover:shadow-[0_20px_60px_-12px_hsl(var(--secondary)/0.4)] hover:scale-[1.02]"
          >
            <div className="relative aspect-[9/16] w-full">
              <video
                src="/videos/tendrix-explainer.mov"
                className="absolute inset-0 w-full h-full object-cover"
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
              />
              {/* Overlay to capture clicks */}
              <div className="absolute inset-0 z-10" />
              {/* Bottom badge */}
              <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-primary/90 to-transparent z-20 flex items-end justify-center pb-3">
                <span className="inline-flex items-center gap-2 text-primary-foreground/90 text-sm font-medium">
                  <Linkedin className="h-4 w-4" />
                  Voir sur LinkedIn
                </span>
              </div>
            </div>
          </a>

          {/* Instagram CTA */}
          <a
            href="https://www.linkedin.com/in/julienmalherbe-/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-primary-foreground hover:text-secondary font-semibold transition-colors"
          >
            <Linkedin className="h-5 w-5" />
            Voir plus sur notre LinkedIn
          </a>
        </div>
      </div>
    </section>
  );
};

export default VideoExplainer;
