import Header from '@/components/Header';
import Hero from '@/components/Hero';
import SocialProofStrip from '@/components/SocialProofStrip';
import PainPoint from '@/components/PainPoint';
import HowItWorks from '@/components/HowItWorks';
import AppScreenshots from '@/components/AppScreenshots';
import CreditPhilosophy from '@/components/CreditPhilosophy';
import Pricing from '@/components/Pricing';
import FinalCTA from '@/components/FinalCTA';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        {/* 1. Hero — proposition de valeur + CTA questionnaire */}
        <Hero />

        {/* 2. Chiffres clés — preuves sociales */}
        <SocialProofStrip />

        {/* 3. Trois piliers — Détection / Analyse / Réponse */}
        <PainPoint />

        {/* 4. Comment ça marche — 3 étapes */}
        <HowItWorks />

        {/* 5. Screenshots produit */}
        <AppScreenshots />

        {/* 6. Philosophie crédit vs abonnement */}
        <CreditPhilosophy />

        {/* 7. Tarifs */}
        <Pricing />

        {/* 8. CTA de fermeture */}
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
