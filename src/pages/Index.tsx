import Nav from "@/components/site/Nav";
import Hero from "@/components/site/Hero";
import About from "@/components/site/About";
import Philosophy from "@/components/site/Philosophy";
import Framework from "@/components/site/Framework";
import Services from "@/components/site/Services";
import Coach from "@/components/site/Coach";
import PublicSlots from "@/components/site/PublicSlots";
// Application form will be rebuilt in Phase 4 per the new spec
import Proof from "@/components/site/Proof";
import CTA from "@/components/site/CTA";
import Footer from "@/components/site/Footer";
import StickyCTA from "@/components/site/StickyCTA";

const Index = () => {
  return (
    <main className="bg-background text-foreground">
      <Nav />
      <Hero />
      <About />
      <Philosophy />
      <Framework />
      <Services />
      <Coach />
      <Proof />
      <PublicSlots />
      
      <CTA />
      <Footer />
      <StickyCTA />
    </main>
  );
};

export default Index;
