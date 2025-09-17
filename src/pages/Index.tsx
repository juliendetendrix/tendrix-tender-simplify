import Header from '@/components/Header';
import Hero from '@/components/Hero';
import FirstBlock from '@/components/FirstBlock';
import ProcessFlow from '@/components/ProcessFlow';
import RemainingBlocks from '@/components/RemainingBlocks';
import TenderPreview from '@/components/TenderPreview';
import CentralizedPlatform from '@/components/CentralizedPlatform';
import Callout from '@/components/Callout';
import Testimonials from '@/components/Testimonials';
import Pricing from '@/components/Pricing';
import FAQ from '@/components/FAQ';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <FirstBlock />
        <ProcessFlow />
        <RemainingBlocks />
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
