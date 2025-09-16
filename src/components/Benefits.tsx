import { Clock, Users, Target, Eye } from 'lucide-react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

const Benefits = () => {
  const { ref: sectionRef, isVisible } = useScrollAnimation();
  const benefits = [
    {
      icon: Clock,
      title: 'Simplicity',
      description: 'No more complex tender platforms. Everything you need in one intuitive interface.',
    },
    {
      icon: Target,
      title: 'Speed',
      description: 'Get professional tender responses in hours, not weeks. Save time and win more.',
    },
    {
      icon: Users,
      title: 'Expertise',
      description: 'Our team of tender specialists ensures every response meets industry standards.',
    },
    {
      icon: Eye,
      title: 'Transparency',
      description: 'Clear pricing, no hidden fees. You know exactly what you get and what you pay.',
    },
  ];

  return (
    <section ref={sectionRef} className="section-padding bg-white">
      <div className="container-max">
        <div className={`text-center mb-16 transition-all duration-800 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
          <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-6">
            Why choose Tendrix?
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            The benefits that make us different
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className={`bg-card rounded-2xl p-8 shadow-soft hover:shadow-medium transition-all duration-300 border border-border ${
                isVisible ? 'animate-fade-in-up' : 'opacity-0 translate-y-8'
              }`}
              style={{ animationDelay: `${0.1 + index * 0.15}s` }}
            >
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center flex-shrink-0">
                  <benefit.icon className="h-6 w-6 text-secondary-foreground" />
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">
                    {benefit.title}
                  </h3>
                  
                  <p className="text-muted-foreground leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Benefits;