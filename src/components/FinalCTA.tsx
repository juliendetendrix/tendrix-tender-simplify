import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const FinalCTA = () => {
  const navigate = useNavigate();

  return (
    <section className="py-20 bg-primary relative overflow-hidden">
      {/* Déco blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-white/5 rounded-full blur-2xl" />
        <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-secondary/15 rounded-full blur-3xl" />
      </div>

      <div className="container-max relative z-10 text-center">
        <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
          Prêt à trouver votre prochain marché public ?
        </h2>
        <p className="text-white/70 text-lg mb-10 max-w-lg mx-auto">
          Créez votre profil en 2 minutes et recevez dès aujourd'hui les appels d'offres faits pour vous.
        </p>

        <button
          onClick={() => navigate('/questionnaire-pme')}
          className="inline-flex items-center gap-2 font-bold text-base px-10 py-4 rounded-xl transition-opacity hover:opacity-90"
          style={{ backgroundColor: '#f9bd43', color: '#0c1c98' }}
        >
          Commencer gratuitement
          <ArrowRight className="w-5 h-5" />
        </button>

        <p className="text-white/50 text-sm mt-5">
          3 crédits offerts · Sans abonnement · Sans engagement
        </p>
      </div>
    </section>
  );
};

export default FinalCTA;
