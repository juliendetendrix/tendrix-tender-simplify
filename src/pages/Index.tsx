import Header from '@/components/Header';
import Hero from '@/components/Hero';
import SocialProofStrip from '@/components/SocialProofStrip';
import PainPoint from '@/components/PainPoint';
import HowItWorks from '@/components/HowItWorks';
import AppScreenshots from '@/components/AppScreenshots';
import Testimonials from '@/components/Testimonials';
import CreditPhilosophy from '@/components/CreditPhilosophy';
import Pricing from '@/components/Pricing';
import FinalCTA from '@/components/FinalCTA';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        {/* 1. Hero — proposition de valeur + CTA */}
        <Hero />

        {/* 2. Chiffres clés */}
        <SocialProofStrip />

        {/* 3. Le problème — 3 obstacles des artisans */}
        <PainPoint />

        {/* 4. Comment ça marche — 3 étapes */}
        <HowItWorks />

        {/* 5. Fonctionnalités produit */}
        <AppScreenshots />

        {/* 6. Témoignages */}
        <Testimonials />

        {/* 7. Philosophie crédit vs abonnement */}
        <CreditPhilosophy />

        {/* 8. Tarifs */}
        <Pricing />

        {/* 9. CTA de fermeture */}
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
