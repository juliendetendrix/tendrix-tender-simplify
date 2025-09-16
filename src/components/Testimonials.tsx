import testimonial1 from '@/assets/testimonial-1.jpg';
import testimonial2 from '@/assets/testimonial-2.jpg';
import testimonial3 from '@/assets/testimonial-3.jpg';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

const Testimonials = () => {
  const { ref: sectionRef, isVisible } = useScrollAnimation();
  const testimonials = [
    {
      quote: "Tendrix a complètement transformé notre approche des appels d'offres publics. Ce qui prenait des semaines ne prend maintenant que quelques heures.",
      author: "Sarah Martinez",
      role: "PDG, TechSolutions France",
      avatar: testimonial1,
    },
    {
      quote: "La qualité des réponses que nous obtenons via Tendrix est exceptionnelle. Nous avons remporté 3 contrats majeurs en seulement 2 mois.",
      author: "Pierre Dubois",
      role: "Directeur, GreenBuild Consulting",
      avatar: testimonial2,
    },
    {
      quote: "Enfin, une solution qui comprend les PME. Simple, efficace et incroyablement performante.",
      author: "Marie Lefebvre",
      role: "Fondatrice, Digital Innovations",
      avatar: testimonial3,
    },
  ];

  return (
    <section ref={sectionRef} className="section-padding bg-white">
      <div className="container-max">
        <div className={`text-center mb-16 transition-all duration-800 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
          <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-6">
            Ce que disent nos clients
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            De vrais résultats pour de vraies entreprises
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className={`bg-card rounded-2xl p-8 shadow-soft hover:shadow-medium transition-all duration-300 border border-border ${
                isVisible ? 'animate-fade-in-up' : 'opacity-0 translate-y-8'
              }`}
              style={{ animationDelay: `${0.1 + index * 0.3}s` }}
            >
              <blockquote className="text-muted-foreground mb-6 leading-relaxed">
                "{testimonial.quote}"
              </blockquote>
              
              <div className="flex items-center">
                <img
                  src={testimonial.avatar}
                  alt={`${testimonial.author} profile picture`}
                  className="w-12 h-12 rounded-full object-cover mr-4"
                />
                <div>
                  <div className="font-semibold text-foreground">
                    {testimonial.author}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {testimonial.role}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;