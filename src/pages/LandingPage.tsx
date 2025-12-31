import { Hero } from '../components/landing/Hero';
import { ValueProps } from '../components/landing/ValueProps';
import { SocialProof } from '../components/landing/SocialProof';
import { LandingHeader } from '../components/landing/LandingHeader';
import { Footer } from '../components/landing/Footer';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <LandingHeader />
      <main>
        <Hero />
        <ValueProps />
        <SocialProof />
      </main>
      <Footer />
    </div>
  );
}
