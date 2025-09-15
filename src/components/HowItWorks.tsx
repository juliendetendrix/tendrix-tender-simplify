import { Search, FileText, Zap } from 'lucide-react';

const HowItWorks = () => {
  const steps = [
    {
      icon: Search,
      title: 'Discover tenders',
      description: 'Our AI scans thousands of public tenders and matches them to your business profile and capabilities.',
    },
    {
      icon: FileText,
      title: 'Request a response',
      description: 'Simply click to request a professional tender response tailored to your company and the specific requirements.',
    },
    {
      icon: Zap,
      title: 'Get results fast',
      description: 'Receive a complete, ready-to-submit tender response within hours, not days or weeks.',
    },
  ];

  return (
    <section id="how-it-works" className="section-padding bg-gradient-hero">
      <div className="container-max">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-6">
            How it works
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            From discovery to submission in three simple steps
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((step, index) => (
            <div
              key={index}
              className="text-center group"
            >
              <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-medium">
                <step.icon className="h-8 w-8 text-primary-foreground" />
              </div>
              
              <h3 className="text-xl font-semibold text-foreground mb-4">
                {step.title}
              </h3>
              
              <p className="text-muted-foreground leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;