import { Check } from 'lucide-react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

const Pricing = () => {
  const { ref: sectionRef, isVisible } = useScrollAnimation();
  const plans = [
    {
      name: 'Starter',
      price: '€99',
      period: '/month',
      description: 'Perfect for small businesses getting started',
      features: [
        'Up to 5 tender responses per month',
        'Basic tender matching',
        'Email support',
        'Standard response templates',
      ],
      popular: false,
    },
    {
      name: 'Pro',
      price: '€299',
      period: '/month',
      description: 'For growing businesses that need more',
      features: [
        'Up to 20 tender responses per month',
        'Advanced AI matching',
        'Priority support',
        'Custom response templates',
        'Success analytics',
        'Dedicated account manager',
      ],
      popular: true,
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: '',
      description: 'Tailored solutions for large organizations',
      features: [
        'Unlimited tender responses',
        'Enterprise-grade matching',
        '24/7 phone support',
        'Fully custom templates',
        'Advanced analytics & reporting',
        'API access',
        'White-label options',
      ],
      popular: false,
    },
  ];

  return (
    <section ref={sectionRef} id="pricing" className="section-padding bg-gradient-hero">
      <div className="container-max">
        <div className={`text-center mb-16 transition-all duration-800 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
          <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-6">
            Simple, transparent pricing
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Choose the plan that fits your business needs
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`bg-white rounded-2xl p-8 shadow-soft hover:shadow-medium transition-all duration-300 border-2 relative ${
                plan.popular 
                  ? 'border-primary scale-105 animate-pulse-glow' 
                  : 'border-border hover:border-primary/50'
              } ${
                isVisible ? 'animate-scale-in' : 'opacity-0 scale-95'
              }`}
              style={{ animationDelay: `${0.1 + index * 0.2}s` }}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}
              
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-foreground mb-2">
                  {plan.name}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {plan.description}
                </p>
                <div className="flex items-baseline justify-center">
                  <span className="text-4xl font-bold text-foreground">
                    {plan.price}
                  </span>
                  <span className="text-muted-foreground ml-1">
                    {plan.period}
                  </span>
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center">
                    <Check className="h-5 w-5 text-primary mr-3 flex-shrink-0" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-300 hover:scale-105 ${
                  plan.popular
                    ? 'btn-primary'
                    : 'btn-outline'
                }`}
              >
                Choose this plan
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;