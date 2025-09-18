import Header from '@/components/Header';
import Hero from '@/components/Hero';
import HowItWorks from '@/components/HowItWorks';
import BetaQuestionnaire from '@/components/BetaQuestionnaire';
import { useBetaQuestionnaire } from '@/hooks/useBetaQuestionnaire';

import TenderPreview from '@/components/TenderPreview';
import CentralizedPlatform from '@/components/CentralizedPlatform';
import Callout from '@/components/Callout';
import Testimonials from '@/components/Testimonials';
import Pricing from '@/components/Pricing';
import FAQ from '@/components/FAQ';
import Footer from '@/components/Footer';

const Index = () => {
  const { isQuestionnaireOpen, closeQuestionnaire } = useBetaQuestionnaire();

  return (
    <div className="min-h-screen">
      <BetaQuestionnaire isOpen={isQuestionnaireOpen} onClose={closeQuestionnaire} />
      <Header />
      <main>
        <Hero />
        <HowItWorks />
        <TenderPreview />
        <CentralizedPlatform />
        <Callout />
        <Testimonials />
        <Pricing />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
