const SocialProof = () => {
  const companyLogos = [
    'Company A',
    'Company B', 
    'Company C',
    'Company D',
    'Company E'
  ];

  return (
    <section className="py-12 bg-white">
      <div className="container-max">
        <div className="text-center">
          <p className="text-muted-foreground mb-8 text-lg">
            Already trusted by ambitious companies in France
          </p>
          
          <div className="flex flex-wrap justify-center items-center gap-8 lg:gap-12 opacity-60">
            {companyLogos.map((company, index) => (
              <div
                key={index}
                className="flex items-center justify-center h-12 w-32 bg-muted rounded-lg"
              >
                <span className="text-sm font-medium text-muted-foreground">
                  {company}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SocialProof;