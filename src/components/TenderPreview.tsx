import { Calendar, Building, Euro } from 'lucide-react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { useBetaQuestionnaire } from '@/hooks/useBetaQuestionnaire';

const TenderPreview = () => {
  const { ref: sectionRef, isVisible } = useScrollAnimation();
  const { openQuestionnaire } = useBetaQuestionnaire();
  
  const tenders = [
    {
      title: 'Rénovation énergétique des bâtiments publics',
      buyer: 'Mairie du 13ème arrondissement de Paris',
      budget: '€180,000 - €320,000',
      deadline: '2024-02-15',
      summary: 'Modernisation énergétique des équipements municipaux incluant isolation thermique, installation de pompes à chaleur et systèmes de ventilation.',
    },
    {
      title: 'Services informatiques et cybersécurité',
      buyer: 'Hôpital de la Pitié-Salpêtrière',
      budget: '€95,000 - €150,000',
      deadline: '2024-01-30',
      summary: 'Mise en place d\'une infrastructure de sécurité informatique renforcée avec solutions de sauvegarde et protection des données de santé.',
    },
    {
      title: 'Aménagement d\'espaces verts urbains',
      buyer: 'Ville de Paris - Secteur 13ème',
      budget: '€60,000 - €110,000',
      deadline: '2024-02-08',
      summary: 'Conception et réalisation d\'espaces verts écologiques dans le quartier de la Butte-aux-Cailles avec végétalisation et mobilier urbain.',
    },
  ];

  return (
    <section ref={sectionRef} className="section-padding bg-gradient-hero">
      <div className="container-max">
        <div className={`text-center mb-16 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
          <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-6">
            Récentes opportunités
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Des appels d'offres près de chez vous
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {tenders.map((tender, index) => (
            <div
              key={index}
              className={`bg-white rounded-2xl p-6 shadow-soft hover:shadow-medium hover:scale-105 transition-all duration-300 border border-border group ${
                isVisible ? 'animate-fade-in-up' : 'opacity-0 translate-y-8'
              }`}
              style={{ animationDelay: `${0.2 + index * 0.2}s` }}
            >
              <h3 className="text-xl font-semibold text-foreground mb-4 line-clamp-2">
                {tender.title}
              </h3>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center text-muted-foreground">
                  <Building className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span className="text-sm">{tender.buyer}</span>
                </div>
                
                <div className="flex items-center text-muted-foreground">
                  <Euro className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span className="text-sm font-medium">{tender.budget}</span>
                </div>
                
                <div className="flex items-center text-muted-foreground">
                  <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span className="text-sm">Date limite : {tender.deadline}</span>
                </div>
              </div>
              
              <p className="text-muted-foreground text-sm mb-6 line-clamp-3">
                {tender.summary}
              </p>
              
              <button 
                onClick={openQuestionnaire}
                className="btn-secondary w-full group-hover:bg-secondary-hover"
              >
                Demander une réponse
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TenderPreview;