import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

const FAQ = () => {
  const { ref: sectionRef, isVisible } = useScrollAnimation();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: 'How does Tendrix find relevant tenders for my business?',
      answer: 'Our AI-powered matching system analyzes your business profile, capabilities, and past performance to identify the most relevant tender opportunities from thousands of public procurement notices published daily.',
    },
    {
      question: 'How quickly can I get a tender response?',
      answer: 'Most tender responses are delivered within 24-48 hours. For urgent deadlines, we offer express service with responses delivered within 6-12 hours for an additional fee.',
    },
    {
      question: 'What makes your tender responses different?',
      answer: 'Our responses are crafted by experienced tender specialists who understand both the public procurement process and your specific industry. Each response is tailored to your company and optimized for the specific tender requirements.',
    },
    {
      question: 'Can I customize the tender responses?',
      answer: 'Absolutely! All responses are fully customizable. You can review, edit, and approve each response before submission. We also create custom templates based on your preferences and past successful bids.',
    },
    {
      question: 'What if I need help with the tender submission process?',
      answer: 'Our team provides full support throughout the entire process, from initial tender discovery to final submission. Pro and Enterprise customers get dedicated account managers for personalized assistance.',
    },
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section ref={sectionRef} className="section-padding bg-white">
      <div className="container-max">
        <div className={`text-center mb-16 transition-all duration-800 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
          <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-6">
            Frequently asked questions
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Everything you need to know about Tendrix
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className={`border border-border rounded-2xl mb-4 overflow-hidden transition-all duration-600 ${
                isVisible ? 'animate-fade-in-up' : 'opacity-0 translate-y-4'
              }`}
              style={{ animationDelay: `${0.1 + index * 0.1}s` }}
            >
              <button
                className="w-full p-6 text-left flex items-center justify-between hover:bg-muted/50 transition-colors duration-200"
                onClick={() => toggleFAQ(index)}
              >
                <h3 className="text-lg font-semibold text-foreground pr-4">
                  {faq.question}
                </h3>
                {openIndex === index ? (
                  <Minus className="h-5 w-5 text-primary flex-shrink-0" />
                ) : (
                  <Plus className="h-5 w-5 text-primary flex-shrink-0" />
                )}
              </button>
              
              {openIndex === index && (
                <div className="px-6 pb-6 border-t border-border animate-accordion-down">
                  <p className="text-muted-foreground leading-relaxed pt-4">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;