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

          {/* Right Content - Technical Interface Mockup */}
          <div className="relative">
            <div className="bg-card/90 backdrop-blur border border-white/20 rounded-3xl p-8 shadow-strong">
              <div className="space-y-6">
                {/* Header with stats */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  </div>
                  <div className="text-xs text-muted-foreground font-mono">tendrix.ai/dashboard</div>
                </div>
                
                {/* Top metrics cards */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white/10 backdrop-blur border border-white/20 rounded-xl p-4 h-20">
                    <div className="text-xs text-primary-foreground/60 mb-1">Active Tenders</div>
                    <div className="text-lg font-bold text-primary-foreground">127</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur border border-white/20 rounded-xl p-4 h-20">
                    <div className="text-xs text-primary-foreground/60 mb-1">Win Rate</div>
                    <div className="text-lg font-bold text-green-400">89%</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur border border-white/20 rounded-xl p-4 h-20">
                    <div className="text-xs text-primary-foreground/60 mb-1">AI Matches</div>
                    <div className="text-lg font-bold text-blue-400">23</div>
                  </div>
                </div>
                
                {/* Main content area */}
                <div className="bg-white/10 backdrop-blur border border-white/20 rounded-xl p-6 h-36">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-sm font-semibold text-primary-foreground">Recent Tender Matches</div>
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary/30 rounded-lg"></div>
                      <div className="flex-1">
                        <div className="w-32 h-3 bg-white/20 rounded-full"></div>
                        <div className="w-20 h-2 bg-white/10 rounded-full mt-1"></div>
                      </div>
                      <div className="w-12 h-6 bg-green-400/20 rounded-lg"></div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-accent/30 rounded-lg"></div>
                      <div className="flex-1">
                        <div className="w-28 h-3 bg-white/20 rounded-full"></div>
                        <div className="w-16 h-2 bg-white/10 rounded-full mt-1"></div>
                      </div>
                      <div className="w-12 h-6 bg-blue-400/20 rounded-lg"></div>
                    </div>
                  </div>
                </div>
                
                {/* Bottom action buttons */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/10 backdrop-blur border border-white/20 rounded-xl p-4 h-12 flex items-center justify-center">
                    <div className="text-xs text-primary-foreground/80 font-medium">Generate Response</div>
                  </div>
                  <div className="bg-primary/20 backdrop-blur border border-primary/30 rounded-xl p-4 h-12 flex items-center justify-center">
                    <div className="text-xs text-primary-foreground font-medium">AI Analysis</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Floating elements for technical feel */}
            <div className="absolute -top-3 -right-3 w-6 h-6 bg-primary/40 rounded-lg blur-sm"></div>
            <div className="absolute -bottom-3 -left-3 w-8 h-8 bg-accent/30 rounded-xl blur-sm"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;