import { Bell, FileCheck, MessageSquare, Star, MapPin, Zap } from 'lucide-react';

const features = [
  {
    icon: Bell,
    title: 'Alertes personnalisées',
    description: 'Seuls les marchés qui correspondent à votre métier et votre zone. Zéro bruit.',
  },
  {
    icon: Zap,
    title: 'Résumé IA en 15 secondes',
    description: "Montant estimé, critères d'attribution, délai. Tout l'essentiel d'un seul coup d'œil.",
  },
  {
    icon: FileCheck,
    title: 'Dossier rédigé par des experts',
    description: "Votre chargé d'affaires rédige le mémoire technique et vérifie toutes les pièces administratives.",
  },
  {
    icon: MessageSquare,
    title: 'Suivi en temps réel',
    description: "Échangez directement avec votre chargé d’affaires. Suivez chaque dossier jusqu’au dépôt.",
  },
  {
    icon: MapPin,
    title: 'France entière ou régional',
    description: "Filtrez par département ou couvrez toute la France. Vous choisissez votre rayon d'action.",
  },
  {
    icon: Star,
    title: 'Score de compatibilité',
    description: 'Chaque AO est noté sur 100 selon votre profil. Plus le score est haut, plus vos chances sont élevées.',
  },
];

const AppScreenshots = () => (
  <section className="section-padding bg-muted/20">
    <div className="container-max">
      <div className="text-center mb-12">
        <p className="text-sm font-bold uppercase tracking-widest text-primary/60 mb-3">
          La plateforme
        </p>
        <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
          Conçue pour les artisans, pas pour les juristes.
        </h2>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto">
          Accessible sur mobile. Vos marchés, vos dossiers, votre expert — au même endroit.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {features.map((f, i) => {
          const Icon = f.icon;
          return (
            <div
              key={i}
              className="bg-white border border-border rounded-xl p-6 hover:shadow-medium transition-shadow duration-300 flex gap-4"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ backgroundColor: '#eef0ff' }}
              >
                <Icon className="w-5 h-5" style={{ color: '#0c1c98' }} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground mb-1">{f.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{f.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  </section>
);

export default AppScreenshots;
