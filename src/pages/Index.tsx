import Header from '@/components/Header';
import Hero from '@/components/Hero';
import HowItWorks from '@/components/HowItWorks';

import TenderPreview from '@/components/TenderPreview';
import HowTendrixWorks from '@/components/HowTendrixWorks';
import CentralizedPlatform from '@/components/CentralizedPlatform';
import Callout from '@/components/Callout';
import Testimonials from '@/components/Testimonials';
import Pricing from '@/components/Pricing';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <HowItWorks />
        <TenderPreview />
        <HowTendrixWorks />
        <CentralizedPlatform />
        <Callout />
        <Testimonials />
        <Pricing />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
