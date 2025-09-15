const Callout = () => {
  return (
    <section className="section-padding bg-primary relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-64 h-64 bg-secondary rounded-full -translate-x-32 -translate-y-32"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary rounded-full translate-x-48 translate-y-48"></div>
      </div>
      
      <div className="container-max relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          <h2 className="text-3xl lg:text-5xl font-bold text-primary-foreground mb-6">
            Get access to tenders matching your business today.
          </h2>
          
          <p className="text-xl text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
            Join thousands of businesses already using Tendrix to win more contracts and grow faster.
          </p>
          
          <button className="btn-secondary text-lg px-8 py-4 hover:scale-105 transition-transform">
            Join the waitlist
          </button>
        </div>
      </div>
    </section>
  );
};

export default Callout;