import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { Linkedin, Instagram, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

const videos = [
  {
    id: 'linkedin',
    src: '/videos/tendrix-explainer.mov',
    href: 'https://www.linkedin.com/posts/julienmalherbe-_cest-lanc%C3%A9-apr%C3%A8s-plusieurs-mois-de-travail-activity-7430506561002745856-OblB?utm_source=share&utm_medium=member_desktop&rcm=ACoAADM_yQcBTeNysd4eLCiYJDW_lR-9HkdWPYo',
    badge: 'Voir sur LinkedIn',
    icon: Linkedin,
    ctaLabel: 'Voir plus sur notre LinkedIn',
    ctaHref: 'https://www.linkedin.com/in/julienmalherbe-/',
  },
  {
    id: 'instagram',
    src: '/videos/instagram-reel.mov',
    href: 'https://www.instagram.com/reel/DPiV0g9iLTE/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==',
    badge: 'Voir sur Instagram',
    icon: Instagram,
    ctaLabel: 'Voir plus sur notre Instagram',
    ctaHref: 'https://www.instagram.com/tendrix.fr',
  },
];

const VideoExplainer = () => {
  const { ref: sectionRef, isVisible } = useScrollAnimation();
  const [current, setCurrent] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [direction, setDirection] = useState<'left' | 'right'>('right');

  const navigate = (dir: 'left' | 'right') => {
    if (isAnimating) return;
    setDirection(dir);
    setIsAnimating(true);
    setTimeout(() => {
      setCurrent((c) =>
        dir === 'right'
          ? (c + 1) % videos.length
          : c === 0 ? videos.length - 1 : c - 1
      );
      setIsAnimating(false);
    }, 400);
  };

  const goTo = (i: number) => {
    if (i === current || isAnimating) return;
    navigate(i > current ? 'right' : 'left');
  };

  const video = videos[current];
  const nextIdx = (current + 1) % videos.length;
  const nextVideo = videos[nextIdx];
  const Icon = video.icon;

  return (
    <section ref={sectionRef} id="video" className="section-padding bg-primary relative overflow-hidden">
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
          <div className="relative w-full max-w-lg mx-auto flex items-center justify-center">
            {/* Prev */}
            <button
              onClick={() => navigate('left')}
              className="absolute left-0 sm:-left-6 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-primary-foreground/10 border border-primary-foreground/20 flex items-center justify-center text-primary-foreground hover:bg-primary-foreground/20 transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <div className="relative w-full max-w-sm mx-auto" style={{ aspectRatio: '9/16' }}>
              {/* Peek card (next video) */}
              <div
                onClick={() => navigate('right')}
                className={`hidden sm:block absolute top-4 -right-20 w-[70%] rounded-2xl overflow-hidden cursor-pointer border border-primary-foreground/10 transition-all duration-400 ease-out ${
                  isAnimating && direction === 'right'
                    ? 'opacity-100 blur-0 scale-100 -right-0 top-0 w-full z-20'
                    : isAnimating && direction === 'left'
                    ? 'opacity-0 scale-75 -right-28'
                    : 'opacity-40 blur-[1px] scale-90 hover:opacity-50'
                }`}
                style={{ aspectRatio: '9/16' }}
              >
                <video
                  src={nextVideo.src}
                  className="w-full h-full object-cover"
                  autoPlay muted loop playsInline preload="metadata"
                />
              </div>

              {/* Main card */}
              <a
                href={video.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`group relative block w-full rounded-3xl overflow-hidden shadow-strong bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 hover:border-secondary/50 z-10 transition-all duration-400 ease-out ${
                  isAnimating
                    ? direction === 'right'
                      ? 'opacity-0 -translate-x-16 scale-90'
                      : 'opacity-0 translate-x-16 scale-90'
                    : 'opacity-100 translate-x-0 scale-100 hover:shadow-[0_20px_60px_-12px_hsl(var(--secondary)/0.4)] hover:scale-[1.02]'
                }`}
              >
                <div className="relative aspect-[9/16] w-full">
                  <video
                    key={video.id}
                    src={video.src}
                    className="absolute inset-0 w-full h-full object-cover"
                    autoPlay muted loop playsInline preload="metadata"
                  />
                  <div className="absolute inset-0 z-10" />
                  <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-primary/90 to-transparent z-20 flex items-end justify-center pb-3">
                    <span className="inline-flex items-center gap-2 text-primary-foreground/90 text-sm font-medium">
                      <Icon className="h-4 w-4" />
                      {video.badge}
                    </span>
                  </div>
                </div>
              </a>
            </div>

            {/* Next */}
            <button
              onClick={() => navigate('right')}
              className="absolute right-0 sm:-right-6 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-primary-foreground/10 border border-primary-foreground/20 flex items-center justify-center text-primary-foreground hover:bg-primary-foreground/20 transition-colors"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          {/* Dots */}
          <div className="flex gap-2">
            {videos.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  i === current ? 'bg-secondary w-6' : 'bg-primary-foreground/30 hover:bg-primary-foreground/50'
                }`}
              />
            ))}
          </div>

          {/* Dynamic CTA */}
          <a
            href={video.ctaHref}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-2 text-primary-foreground hover:text-secondary font-semibold transition-all duration-300 ${
              isAnimating ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
            }`}
          >
            <Icon className="h-5 w-5" />
            {video.ctaLabel}
          </a>
        </div>
      </div>
    </section>
  );
};

export default VideoExplainer;
