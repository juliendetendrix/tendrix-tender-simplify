import { useNavigate } from 'react-router-dom';
import { Plus, Link, FileSearch, CheckCircle2 } from 'lucide-react';

const ImportFeature = () => {
  const navigate = useNavigate();

  return (
    <section className="py-16 bg-background">
      <div className="container-max">
        <div className="max-w-2xl mx-auto">
          {/* Titre */}
          <div className="text-center mb-10">
            <div
              className="inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-4"
              style={{ backgroundColor: '#f9bd43' }}
            >
              <Plus className="w-6 h-6" style={{ color: '#0c1c98' }} />
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-3">
              Vous avez un appel d'offres précis en tête ?
            </h2>
            <p className="text-muted-foreground text-lg">
              Importez n'importe quel marché directement dans Tendrix —
              notre IA l'analyse et prépare votre dossier, même si vous l'avez trouvé ailleurs.
            </p>
          </div>

          {/* Étapes */}
          <div className="bg-white border border-border rounded-3xl p-6 shadow-sm space-y-5">
            {[
              {
                icon: Link,
                title: 'Collez le lien ou la référence',
                desc: 'URL du profil acheteur, numéro BOAMP, ou lien direct vers le DCE.',
              },
              {
                icon: FileSearch,
                title: "L'IA analyse l'appel d'offres en entier",
                desc: 'Lots, montants, critères, dates clés — résumé complet en 15 secondes.',
              },
              {
                icon: CheckCircle2,
                title: 'Recevez votre dossier de réponse',
                desc: 'Arguments de vente, conformité administrative, structure gagnante.',
              },
            ].map(({ icon: Icon, title, desc }, i) => (
              <div key={i} className="flex items-start gap-4">
                <div
                  className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center mt-0.5"
                  style={{ backgroundColor: '#0c1c98' }}
                >
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-foreground text-sm">{title}</p>
                  <p className="text-muted-foreground text-sm mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-8 text-center">
            <button
              onClick={() => navigate('/questionnaire-pme')}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl font-bold text-base transition-all hover:opacity-90"
              style={{ backgroundColor: '#f9bd43', color: '#0c1c98' }}
            >
              <Plus className="w-5 h-5" />
              Importer un appel d'offres
            </button>
            <p className="text-xs text-muted-foreground mt-3">Sans abonnement · 3 crédits offerts</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ImportFeature;
