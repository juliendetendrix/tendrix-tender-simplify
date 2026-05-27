import mobileMockup from '@/assets/mobile-mockup-new.png';
import { useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="relative pt-20 pb-0 lg:pt-24 bg-background overflow-hidden">
      {/* Background blobs */}
      <div className="absolute inset-0 opacity-[0.07] pointer-events-none">
        <div className="absolute top-10 left-0 w-[500px] h-[500px] bg-primary rounded-full blur-3xl" />
        <div className="absolute top-32 right-0 w-[400px] h-[400px] bg-secondary rounded-full blur-3xl" />
      </div>

      <div className="container-max relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Left: texte */}
          <div className="text-center lg:text-left max-w-xl mx-auto lg:mx-0 pt-8 pb-10 lg:py-16">
            {/* Headline */}
            <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-5 leading-tight">
              Les grands groupes ont une équipe dédiée aux marchés publics.{' '}
              <span className="gradient-text">Vous avez Tendrix.</span>
            </h1>

            {/* Sous-titre */}
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Recevez les marchés qui vous correspondent, décidez en{' '}
              <strong className="text-foreground">15 secondes</strong>
              {' '}et obtenez votre dossier de réponse clé en main.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start mb-6">
              <button
                onClick={() => navigate('/questionnaire-pme')}
                className="btn-primary text-base px-8 py-3.5 font-bold"
              >
                Commencer gratuitement →
              </button>
              <a
                href="#comment-ca-marche"
                className="btn-outline text-base px-8 py-3.5 inline-flex items-center justify-center"
              >
                Voir comment ça marche
              </a>
            </div>

            {/* Réassurance */}
            <div className="flex flex-wrap gap-x-5 gap-y-2 justify-center lg:justify-start">
              {['3 crédits offerts', 'Sans abonnement', 'Sans engagement'].map((item) => (
                <div key={item} className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: mockup téléphone */}
          <div className="relative flex justify-center lg:justify-end">
            <div className="relative">
              <div className="absolute -inset-10 bg-primary/8 rounded-full blur-3xl" />
              {/* Remplacer src par un vrai screenshot de l'app quand disponible */}
              <img
                src={mobileMockup}
                alt="Application Tendrix — appels d'offres recommandés"
                className="relative w-[260px] sm:w-[300px] lg:w-[340px] drop-shadow-2xl"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
