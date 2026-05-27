import { useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

// ── Mockup CSS de l'application Tendrix ──────────────────────────────────────
const AppMockup = () => (
  <div className="relative mx-auto select-none" style={{ width: 260 }}>
    {/* Halo derrière */}
    <div className="absolute -inset-8 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

    {/* Coque du téléphone */}
    <div
      className="relative rounded-[40px] p-[10px] shadow-2xl"
      style={{ background: 'linear-gradient(145deg, #1a1a2e 0%, #0f0f1a 100%)' }}
    >
      {/* Encoche */}
      <div
        className="absolute top-[10px] left-1/2 -translate-x-1/2 z-10 rounded-full"
        style={{ width: 80, height: 22, background: '#0f0f1a' }}
      />

      {/* Écran */}
      <div className="bg-white rounded-[32px] overflow-hidden" style={{ height: 530 }}>

        {/* Header app */}
        <div className="bg-white px-4 py-3 flex items-center justify-between border-b border-gray-100 shadow-sm">
          <span className="font-extrabold text-[15px]" style={{ color: '#0c1c98' }}>
            Tendri<span style={{ color: '#f9bd43' }}>✕</span>
          </span>
          <div
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl"
            style={{ backgroundColor: '#0c1c98' }}
          >
            <span className="text-[10px] font-bold text-white">3 crédits</span>
          </div>
        </div>

        {/* Corps */}
        <div className="p-3 space-y-2 bg-gray-50/50" style={{ height: 430 }}>
          <p className="text-xs font-bold mt-1 mb-2" style={{ color: '#0c1c98' }}>Bonjour 👋</p>

          {/* Carte AO 1 */}
          <div className="bg-white border border-gray-100 rounded-xl p-3 shadow-sm space-y-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span
                className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                style={{ backgroundColor: '#eef0ff', color: '#0c1c98' }}
              >
                Travaux
              </span>
              <span
                className="text-[9px] font-bold px-2 py-0.5 rounded-full text-white"
                style={{ backgroundColor: '#f9bd43', color: '#0c1c98' }}
              >
                87% compatible
              </span>
            </div>
            <p className="text-[11px] font-semibold leading-tight text-gray-800">
              Rénovation toiture école primaire Jules Ferry
            </p>
            <p className="text-[10px] text-gray-400">Mairie de Montpellier · Hérault (34)</p>
            <p className="text-[10px] font-bold" style={{ color: '#16a34a' }}>Plus que 12 j ✓</p>
            <div
              className="w-full text-center text-[10px] font-bold py-1.5 rounded-lg"
              style={{ backgroundColor: '#f9bd43', color: '#0c1c98' }}
            >
              Demander une réponse
            </div>
          </div>

          {/* Carte AO 2 */}
          <div className="bg-white border border-gray-100 rounded-xl p-3 shadow-sm space-y-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span
                className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                style={{ backgroundColor: '#eef0ff', color: '#0c1c98' }}
              >
                Travaux
              </span>
              <span
                className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                style={{ backgroundColor: '#f9bd43', color: '#0c1c98' }}
              >
                74% compatible
              </span>
            </div>
            <p className="text-[11px] font-semibold leading-tight text-gray-800">
              Gros œuvre et maçonnerie — gymnase municipal
            </p>
            <p className="text-[10px] text-gray-400">CC Pays de Lunel · Hérault (34)</p>
            <p className="text-[10px] font-bold" style={{ color: '#16a34a' }}>Plus que 25 j ✓</p>
          </div>

          {/* Carte AO 3 partielle */}
          <div className="bg-white border border-gray-100 rounded-xl p-3 shadow-sm opacity-60">
            <div className="flex items-center gap-1.5 mb-1.5">
              <span
                className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                style={{ backgroundColor: '#eef0ff', color: '#0c1c98' }}
              >
                Travaux
              </span>
              <span
                className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                style={{ backgroundColor: '#f9bd43', color: '#0c1c98' }}
              >
                68% compatible
              </span>
            </div>
            <p className="text-[11px] font-semibold leading-tight text-gray-800">
              Ravalement et isolation façades — résidence sociale
            </p>
          </div>
        </div>

        {/* Barre de navigation bas */}
        <div className="absolute bottom-[10px] left-[10px] right-[10px] bg-white border-t border-gray-100 flex items-center justify-around px-2 py-2 rounded-b-[32px]">
          <div className="flex flex-col items-center">
            <div className="w-4 h-4 rounded-full mb-0.5" style={{ backgroundColor: '#0c1c98', opacity: 0.15 }}>
              <div className="w-full h-full rounded-full" style={{ backgroundColor: '#0c1c98' }} />
            </div>
            <span className="text-[8px] font-bold" style={{ color: '#0c1c98' }}>AO</span>
          </div>
          <div className="flex flex-col items-center opacity-40">
            <div className="w-3 h-3 bg-gray-400 rounded mb-0.5" style={{ borderRadius: 2 }} />
            <span className="text-[8px] text-gray-400">Dossiers</span>
          </div>
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center shadow-md"
            style={{ backgroundColor: '#0c1c98' }}
          >
            <span className="text-white text-base leading-none">+</span>
          </div>
          <div className="flex flex-col items-center opacity-40">
            <div className="w-3 h-3 bg-gray-400 rounded mb-0.5" style={{ borderRadius: 2 }} />
            <span className="text-[8px] text-gray-400">Messages</span>
          </div>
          <div className="flex flex-col items-center opacity-40">
            <div className="w-3 h-3 bg-gray-400 rounded-full mb-0.5" />
            <span className="text-[8px] text-gray-400">Compte</span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// ── Hero ──────────────────────────────────────────────────────────────────────
const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="relative pt-16 pb-0 lg:pt-20 bg-background overflow-hidden">
      {/* Blobs décoratifs */}
      <div className="absolute inset-0 opacity-[0.06] pointer-events-none">
        <div className="absolute top-0 left-[-100px] w-[600px] h-[600px] bg-primary rounded-full blur-3xl" />
        <div className="absolute top-40 right-[-80px] w-[500px] h-[500px] bg-secondary rounded-full blur-3xl" />
      </div>

      <div className="container-max relative z-10">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">

          {/* Gauche : texte */}
          <div className="text-center lg:text-left max-w-xl mx-auto lg:mx-0 pt-6 pb-8 lg:py-20">
            <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-5 leading-tight">
              Les grands groupes ont une équipe dédiée aux marchés publics.{' '}
              <span className="gradient-text">Vous avez Tendrix.</span>
            </h1>

            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Recevez les marchés qui vous correspondent, décidez en{' '}
              <strong className="text-foreground">15 secondes</strong>{' '}
              et obtenez votre dossier de réponse clé en main.
            </p>

            <button
              onClick={() => navigate('/questionnaire-pme')}
              className="btn-primary text-base px-10 py-4 font-bold mb-6"
            >
              Commencer gratuitement →
            </button>

            <div className="flex flex-wrap gap-x-5 gap-y-2 justify-center lg:justify-start">
              {['3 crédits offerts', 'Sans abonnement', 'Sans engagement'].map((item) => (
                <div key={item} className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Droite : mockup */}
          <div className="flex justify-center lg:justify-end pb-0 lg:pb-0">
            <AppMockup />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
