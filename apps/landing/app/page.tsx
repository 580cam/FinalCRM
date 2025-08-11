import Header from '@/components/Header';
import Hero from '@/components/Hero';
import SocialProof from '@/components/SocialProof';
import PricingSection from '@/components/PricingSection';
import MovingProcess from '@/components/MovingProcess';
import Differentiators from '@/components/Differentiators';
import FinalCTA from '@/components/FinalCTA';
import Footer from '@/components/Footer';

export default function Page() {
  return (
    <main>
      <Header />
      <Hero />
      <SocialProof />
      <PricingSection />
      <MovingProcess />
      <Differentiators />
      <FinalCTA />
      <Footer />
    </main>
  );
}
