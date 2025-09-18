import { useScrollAnimation } from '@/hooks/useScrollAnimation';

const Callout = () => {
  const { ref: sectionRef, isVisible } = useScrollAnimation();
  
  return (
    <section ref={sectionRef} className="section-padding bg-primary relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-64 h-64 bg-secondary rounded-full -translate-x-32 -translate-y-32"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary rounded-full translate-x-48 translate-y-48"></div>
      </div>
      
      <div className="container-max relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          <h2 className={`text-3xl lg:text-5xl font-bold text-primary-foreground mb-6 transition-all duration-800 ${
            isVisible ? 'animate-fade-in-left' : 'opacity-0 -translate-x-8'
          }`}>
            Concentrez-vous sur votre savoir-faire, on s'occupe du reste
          </h2>
          
          <p className={`text-xl text-primary-foreground/80 mb-8 max-w-2xl mx-auto transition-all duration-800 ${
            isVisible ? 'animate-fade-in-left' : 'opacity-0 -translate-x-8'
          }`} style={{animationDelay: '0.2s'}}>
            Rejoignez des milliers d'entreprises qui utilisent déjà Tendrix pour remporter plus de marchés et accélérer leur croissance.
          </p>
          
          <button 
            className={`btn-secondary text-lg px-8 py-4 ${
              isVisible ? 'animate-bounce-in' : 'opacity-0 translate-y-8'
            }`} 
            style={{animationDelay: '0.4s'}}
          >
            Rejoindre la liste d'attente
          </button>
        </div>
      </div>
    </section>
  );
};

export default Callout;