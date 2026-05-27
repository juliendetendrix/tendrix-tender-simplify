import { Clock, FileX, TrendingDown } from 'lucide-react';

const obstacles = [
  {
    icon: Clock,
    title: 'Trop d\'AOs à trier',
    description:
      'Chaque semaine, des dizaines d\'annonces publiées. Impossible de toutes les lire. Vous manquez des opportunités qui auraient pu vous rapporter.',
  },
  {
    icon: FileX,
    title: 'Les DCE sont illisibles',
    description:
      'Règlement de consultation, CCTP, DPGF… Des centaines de pages techniques à déchiffrer avant de savoir si ça vaut le coup de postuler.',
  },
  {
    icon: TrendingDown,
    title: 'Rédiger un dossier prend 2 jours',
    description:
      'Mémoire technique, attestations, références chantiers… Autant de temps non facturé, sans garantie de décrocher le marché.',
  },
];

const PainPoint = () => (
  <section className="section-padding bg-muted/30">
    <div className="container-max">
      <div className="text-center mb-12">
        <p className="text-sm font-bold uppercase tracking-widest text-primary/60 mb-3">
          Le problème
        </p>
        <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
          Répondre aux marchés publics prend un temps fou.
        </h2>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto">
          Vous avez les compétences. Ce qui vous manque, c'est le temps — et les ressources d'une grande entreprise.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-10">
        {obstacles.map((o, i) => {
          const Icon = o.icon;
          return (
            <div
              key={i}
              className="bg-white border border-border rounded-2xl p-7 flex flex-col hover:shadow-medium transition-shadow duration-300"
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center mb-5"
                style={{ backgroundColor: '#fff0f0' }}
              >
                <Icon className="w-5 h-5" style={{ color: '#dc2626' }} />
              </div>
              <h3 className="text-base font-bold text-foreground mb-3">{o.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{o.description}</p>
            </div>
          );
        })}
      </div>

      {/* Transition vers la solution */}
      <div
        className="rounded-2xl px-8 py-6 text-center"
        style={{ background: 'linear-gradient(135deg, #0c1c98 0%, #1a2fb8 100%)' }}
      >
        <p className="text-white text-lg font-semibold">
          Tendrix règle les trois problèmes en même temps.{' '}
          <span style={{ color: '#f9bd43' }}>Pour le prix d'un seul dossier.</span>
        </p>
      </div>
    </div>
  </section>
);

export default PainPoint;
