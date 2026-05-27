import { useNavigate } from 'react-router-dom';
import { UserCircle, BellRing, FileCheck } from 'lucide-react';

const steps = [
  {
    number: '01',
    icon: UserCircle,
    tag: 'Votre profil',
    title: 'Créez votre profil en 2 minutes',
    description:
      'Renseignez votre secteur d\'activité (électricien, plombier, maçon…), votre zone géographique et la taille des marchés qui vous intéressent. Tendrix calibre immédiatement ses recherches.',
    details: ['Métier et codes CPV', 'Zone géographique', 'Budget cible'],
  },
  {
    number: '02',
    icon: BellRing,
    tag: 'Détection & analyse',
    title: 'Recevez les bons marchés, prêts à décider',
    description:
      'Chaque jour, notre IA scanne le BOAMP et les plateformes complémentaires. Chaque AO est résumé en quelques lignes avec un score de compatibilité. Vous décidez en 15 secondes.',
    details: ['Résumé IA de chaque appel d\'offres', 'Score de compatibilité sur 100', 'Alerte dès qu\'un marché vous correspond'],
  },
  {
    number: '03',
    icon: FileCheck,
    tag: 'Réponse & dépôt',
    title: 'Postulez en un crédit, nos experts font le reste',
    description:
      'Vous avez trouvé le bon marché ? Déclenchez une réponse avec un crédit. Notre équipe d\'experts certifiés marchés publics rédige votre dossier complet. Vous validez, nous déposons.',
    details: ['Mémoire technique rédigé par des experts', 'Pièces administratives vérifiées', 'Dépôt sur la plateforme acheteur'],
  },
];

const HowItWorks = () => {
  const navigate = useNavigate();

  return (
    <section id="comment-ca-marche" className="section-padding bg-background">
      <div className="container-max">
        <div className="text-center mb-14">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Comment ça marche ?
          </h2>
          <p className="text-lg text-muted-foreground max-w-lg mx-auto">
            De votre profil au dépôt du dossier, Tendrix gère tout.
          </p>
        </div>

        {/* Steps */}
        <div className="grid lg:grid-cols-3 gap-6 mb-14">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={i} className="relative bg-white border border-border rounded-2xl p-6 flex flex-col hover:shadow-medium transition-shadow duration-300">
                {/* Numéro en filigrane */}
                <span className="absolute top-4 right-5 text-6xl font-black text-muted/30 leading-none select-none pointer-events-none">
                  {step.number}
                </span>

                {/* Tag */}
                <div className="inline-flex items-center gap-2 mb-5">
                  <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest text-primary/70">{step.tag}</span>
                </div>

                <h3 className="text-lg font-bold text-foreground mb-3 leading-snug">{step.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-5 flex-1">{step.description}</p>

                <ul className="space-y-1.5">
                  {step.details.map((d, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0 mt-1.5" />
                      <span className="text-foreground">{d}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        <div className="text-center">
          <button
            className="btn-primary px-8 py-3.5 text-base font-bold"
            onClick={() => navigate('/questionnaire-pme')}
          >
            Commencer gratuitement →
          </button>
          <p className="text-sm text-muted-foreground mt-3">Aucune carte bancaire requise.</p>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
