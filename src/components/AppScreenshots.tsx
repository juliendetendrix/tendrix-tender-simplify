import dashboardScreenshot from '@/assets/dashboard-new-screenshot.png';
import mobileMockup from '@/assets/mobile-mockup-new.png';

// TODO: Remplacer les imports ci-dessus par de vrais screenshots de l'app
// quand Julien les fournit. Format recommandé :
//   - Mobile : portrait 390×844 px (ex. capture iPhone)
//   - Desktop : paysage 1280×800 px

const AppScreenshots = () => (
  <section className="section-padding bg-muted/20">
    <div className="container-max">
      <div className="text-center mb-12">
        <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
          Une plateforme conçue pour les artisans du BTP
        </h2>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto">
          Accessible sur mobile comme sur ordinateur. Vos marchés, vos dossiers, votre expert — au même endroit.
        </p>
      </div>

      <div className="grid lg:grid-cols-5 gap-6 lg:gap-10 items-center">
        {/* Mobile — colonne gauche */}
        <div className="lg:col-span-2 flex justify-center">
          <div className="relative">
            <div className="absolute -inset-6 bg-primary/8 rounded-full blur-3xl" />
            <img
              src={mobileMockup}
              alt="App Tendrix mobile — liste d'appels d'offres recommandés"
              className="relative w-[220px] sm:w-[260px] drop-shadow-2xl"
            />
          </div>
        </div>

        {/* Desktop — colonnes droite */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white border border-border rounded-2xl overflow-hidden shadow-medium">
            <img
              src={dashboardScreenshot}
              alt="Dashboard Tendrix — tableau de bord appels d'offres"
              className="w-full h-auto"
            />
          </div>

          {/* Feature chips */}
          <div className="flex flex-wrap gap-2">
            {[
              'Filtrage par secteur & zone',
              'Score de compatibilité IA',
              'Résumé en 15 secondes',
              'Expert dédié inclus',
              'Suivi de vos dossiers',
            ].map((feat) => (
              <span
                key={feat}
                className="text-xs font-semibold px-3 py-1.5 bg-primary/8 text-primary rounded-full border border-primary/15"
              >
                {feat}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default AppScreenshots;
