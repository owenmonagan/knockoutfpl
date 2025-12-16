import { Navbar } from '../components/landing/Navbar';
import { Hero } from '../components/landing/Hero';
import { ValueProps } from '../components/landing/ValueProps';
import { SocialProof } from '../components/landing/SocialProof';

export function LandingPage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <ValueProps />
      <SocialProof />
    </main>
  );
}
