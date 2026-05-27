import testimonial1 from '@/assets/testimonial-1.jpg';
import testimonial2 from '@/assets/testimonial-2.jpg';
import testimonial3 from '@/assets/testimonial-3.jpg';
import { Star } from 'lucide-react';

const reviews = [
  {
    photo: testimonial1,
    name: 'Sarah K.',
    role: 'Gérante — entreprise de peinture',
    location: 'Hérault (34)',
    quote:
      "Avant Tendrix, je ne savais même pas que des marchés publics existaient pour une entreprise de ma taille. En 2 mois, j'ai décroché mon premier contrat avec une mairie.",
    amount: '+42 000 €',
    amountLabel: 'premier marché décroché',
  },
  {
    photo: testimonial2,
    name: 'Thomas R.',
    role: 'Gérant — maçonnerie & gros œuvre',
    location: 'Rhône (69)',
    quote:
      "Le dossier que mon chargé d'affaires a rédigé était irréprochable. Je n'aurais jamais pu le faire seul en maintenant mon activité en parallèle. On a gagné l'appel d'offres.",
    amount: '3 marchés',
    amountLabel: 'remportés en 4 mois',
  },
  {
    photo: testimonial3,
    name: 'Émilie D.',
    role: 'Directrice — électricité tertiaire',
    location: 'Nord (59)',
    quote:
      "Je passais 2 jours à lire les DCE pour finalement abandonner. Maintenant je décide en 15 secondes. Mon taux de réponse a triplé.",
    amount: '×3',
    amountLabel: 'de dossiers soumis',
  },
];

const Stars = () => (
  <div className="flex gap-0.5">
    {Array.from({ length: 5 }).map((_, i) => (
      <Star key={i} className="w-4 h-4 fill-secondary text-secondary" />
    ))}
  </div>
);

const Testimonials = () => (
  <section className="section-padding bg-background">
    <div className="container-max">
      <div className="text-center mb-12">
        <p className="text-sm font-bold uppercase tracking-widest text-primary/60 mb-3">
          Ils nous font confiance
        </p>
        <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
          Des entreprises qui remportent des marchés.
        </h2>
        <p className="text-lg text-muted-foreground max-w-lg mx-auto">
          Des TPE du BTP qui n'auraient jamais cru pouvoir décrocher des marchés publics.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {reviews.map((r, i) => (
          <div
            key={i}
            className="bg-white border border-border rounded-2xl p-7 flex flex-col hover:shadow-medium transition-shadow duration-300"
          >
            <Stars />

            <p className="text-foreground text-sm leading-relaxed my-5 flex-1">
              "{r.quote}"
            </p>

            <div
              className="rounded-xl px-4 py-3 mb-5 text-center"
              style={{ backgroundColor: '#f0f3ff' }}
            >
              <p className="text-2xl font-black" style={{ color: '#0c1c98' }}>{r.amount}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{r.amountLabel}</p>
            </div>

            <div className="flex items-center gap-3">
              <img
                src={r.photo}
                alt={r.name}
                className="w-10 h-10 rounded-full object-cover flex-shrink-0"
              />
              <div>
                <p className="text-sm font-semibold text-foreground">{r.name}</p>
                <p className="text-xs text-muted-foreground">{r.role} · {r.location}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default Testimonials;