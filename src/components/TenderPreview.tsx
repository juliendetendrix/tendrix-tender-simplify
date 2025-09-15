import { Calendar, Building, Euro } from 'lucide-react';

const TenderPreview = () => {
  const tenders = [
    {
      title: 'IT Infrastructure Modernization',
      buyer: 'Ville de Lyon',
      budget: '€150,000 - €300,000',
      deadline: '2024-02-15',
      summary: 'Complete overhaul of municipal IT systems including network infrastructure, security protocols, and cloud migration services.',
    },
    {
      title: 'Green Energy Consulting Services',
      buyer: 'Région Provence-Alpes-Côte d\'Azur',
      budget: '€75,000 - €120,000',
      deadline: '2024-01-30',
      summary: 'Strategic consulting for renewable energy transition, including solar panel installation planning and energy efficiency audits.',
    },
    {
      title: 'Digital Marketing & Communication',
      buyer: 'Métropole de Toulouse',
      budget: '€45,000 - €80,000',
      deadline: '2024-02-08',
      summary: 'Comprehensive digital marketing strategy development including social media management, content creation, and SEO optimization.',
    },
  ];

  return (
    <section className="section-padding bg-gradient-hero">
      <div className="container-max">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-6">
            Recent tender opportunities
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            See the kind of projects you could be bidding on
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {tenders.map((tender, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-6 shadow-soft hover:shadow-medium transition-all duration-300 border border-border group hover:scale-105"
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
                  <span className="text-sm">Deadline: {tender.deadline}</span>
                </div>
              </div>
              
              <p className="text-muted-foreground text-sm mb-6 line-clamp-3">
                {tender.summary}
              </p>
              
              <button className="btn-secondary w-full group-hover:bg-secondary-hover transition-colors">
                Request a response
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TenderPreview;