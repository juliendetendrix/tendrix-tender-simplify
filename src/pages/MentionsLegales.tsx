import Header from '@/components/Header';
import Footer from '@/components/Footer';

const MentionsLegales = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container-max py-20 px-4">
        <h1 className="text-3xl font-bold text-primary text-center mb-2">Mentions légales</h1>
        <p className="text-center text-muted-foreground mb-12">En vigueur au 17/02/2026</p>

        <div className="max-w-3xl mx-auto space-y-8 text-foreground/80 leading-relaxed">
          <p>
            Conformément aux dispositions de la loi n°2004-575 du 21 juin 2004 pour la Confiance en l'économie numérique, il est porté à la connaissance des utilisateurs et visiteurs, ci-après l'"<strong>Utilisateur</strong>", du site tendrix.fr, ci-après le "<strong>Site</strong>", les présentes mentions légales.
          </p>
          <p>
            La connexion et la navigation sur le Site par l'Utilisateur implique acceptation intégrale et sans réserve des présentes mentions légales.
          </p>
          <p>
            Ces dernières sont accessibles sur le Site à la rubrique "<strong>Mentions légales</strong>".
          </p>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-4">EDITION DU SITE</h2>
            <p>
              L'édition du Site est assurée par la société Julien Malherbe, Micro-Entreprise au capital de _______________ euros, immatriculée au Registre du Commerce et des Sociétés de _______________ sous le numéro 952515476 dont le siège social est situé au 45 AVENUE DU GENERAL LECLERC,
            </p>
            <ul className="list-none space-y-1 mt-2">
              <li>&gt; <strong>Numéro de téléphone</strong> : 0771819729</li>
              <li>&gt; <strong>Adresse e-mail</strong> : julien.malherbe@tendrix.fr</li>
              <li>&gt; <strong>N° de TVA intracommunautaire</strong> : _______________</li>
              <li>&gt; <strong>Directeur de la publication</strong> : Julien Malherbe</li>
            </ul>
            <p className="mt-2">ci-après l'"<strong>Editeur</strong>".</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-4">HEBERGEUR</h2>
            <p>
              L'hébergeur du Site est la société Lovable (GPT Engineer Inc.), dont le siège social est situé au 2261 Market Street #5039 94114 San Francisco.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-4">ACCES AU SITE</h2>
            <p>
              Le Site est normalement accessible, à tout moment, à l'Utilisateur. Toutefois, l'Editeur pourra, à tout moment, suspendre, limiter ou interrompre le Site afin de procéder, notamment, à des mises à jour ou des modifications de son contenu. L'Editeur ne pourra en aucun cas être tenu responsable des conséquences éventuelles de cette indisponibilité sur les activités de l'Utilisateur.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-4">COLLECTE DES DONNEES</h2>
            <p>
              Le Site assure à l'Utilisateur une collecte et un traitement des données personnelles dans le respect de la vie privée conformément à la loi n°78-17 du 6 janvier 1978 relative à l'informatique, aux fichiers et aux libertés et dans le respect de la règlementation applicable en matière de traitement des données à caractère personnel conformément au règlement (UE) 2016/679 du Parlement européen et du Conseil du 27 avril 2016 (ci-après, ensemble, la "<strong>Règlementation applicable en matière de protection des Données à caractère personnel</strong>").
            </p>
            <p className="mt-4">
              En vertu de la Règlementation applicable en matière de protection des Données à caractère personnel, l'Utilisateur dispose d'un droit d'accès, de rectification, de suppression et d'opposition de ses données personnelles. L'Utilisateur peut exercer ce droit :
            </p>
            <ul className="list-disc list-inside mt-2">
              <li>par mail à l'adresse email <a href="mailto:contact@tendrix.fr" className="text-primary hover:underline">contact@tendrix.fr</a></li>
            </ul>
            <p className="mt-4">
              Toute utilisation, reproduction, diffusion, commercialisation, modification de toute ou partie du Site, sans autorisation expresse de l'Editeur est prohibée et pourra entraîner des actions et poursuites judiciaires telles que prévues par la règlementation en vigueur.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MentionsLegales;
