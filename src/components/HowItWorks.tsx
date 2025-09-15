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
    <section id="how-it-works" className="section-padding bg-primary relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-primary-foreground/20 to-transparent"></div>
        <div className="absolute bottom-0 right-0 w-full h-32 bg-gradient-to-l from-primary-foreground/20 to-transparent"></div>
      </div>

      <div className="container-max relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            <h2 className="text-3xl lg:text-5xl font-bold text-primary-foreground mb-6">
              How it works
            </h2>
            <p className="text-xl text-primary-foreground/80 max-w-2xl mx-auto lg:mx-0 mb-12">
              From discovery to submission in three simple steps
            </p>

            <div className="space-y-8">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className="flex items-start gap-6 text-left"
                >
                  <div className="w-12 h-12 bg-primary-foreground rounded-xl flex items-center justify-center flex-shrink-0 shadow-medium">
                    <step.icon className="h-6 w-6 text-primary" />
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-primary-foreground mb-2">
                      {step.title}
                    </h3>
                    
                    <p className="text-primary-foreground/80 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Content - Visual */}
          <div className="relative">
            <div className="bg-primary-foreground rounded-3xl p-8 shadow-strong">
              <div className="space-y-6">
                {/* Mock interface elements */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-primary/10 rounded-lg p-4 h-24"></div>
                  <div className="bg-primary/10 rounded-lg p-4 h-24"></div>
                </div>
                <div className="bg-primary/10 rounded-lg p-4 h-32"></div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-primary/10 rounded-lg h-16"></div>
                  <div className="bg-primary/10 rounded-lg h-16"></div>
                  <div className="bg-primary/10 rounded-lg h-16"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;