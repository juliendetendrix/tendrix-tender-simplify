const stats = [
  { value: '350 000+', label: 'marchés publics français centralisés sur la plateforme' },
  { value: '15 sec', label: 'pour décider si un marché vous correspond' },
  { value: '< 24h', label: 'pour recevoir votre dossier de réponse' },
  { value: '0 €', label: 'd\'abonnement pour commencer' },
];

const SocialProofStrip = () => (
  <section className="bg-primary py-10">
    <div className="container-max">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
        {stats.map((stat) => (
          <div key={stat.value} className="text-center">
            <div className="text-3xl lg:text-4xl font-black text-secondary mb-1">{stat.value}</div>
            <div className="text-white/70 text-sm leading-snug">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default SocialProofStrip;
