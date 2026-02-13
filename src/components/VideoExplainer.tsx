import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { Play } from 'lucide-react';

const VideoExplainer = () => {
  const { ref: sectionRef, isVisible } = useScrollAnimation();

  return (
    <section ref={sectionRef} id="video" className="section-padding bg-background">
      <div className="container-max">
        <div className={`text-center mb-12 transition-all duration-800 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
          <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-6">
            On vous l'explique en vidéo
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Découvrez Tendrix en quelques secondes
          </p>
        </div>

        <div className={`flex flex-col items-center gap-8 transition-all duration-800 ${isVisible ? 'animate-scale-in' : 'opacity-0 scale-95'}`}>
          <div className="w-full max-w-md mx-auto rounded-2xl overflow-hidden shadow-medium">
            <iframe
              src="https://www.instagram.com/reel/DUnuP_PDgXV/embed"
              className="w-full aspect-[9/16] border-0"
              allowFullScreen
              loading="lazy"
            />
          </div>

          <a
            href="https://www.instagram.com/tendrix.fr?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-semibold transition-colors"
          >
            <Play className="h-5 w-5" />
            Voir plus de vidéos sur notre Instagram
          </a>
        </div>
      </div>
    </section>
  );
};

export default VideoExplainer;
