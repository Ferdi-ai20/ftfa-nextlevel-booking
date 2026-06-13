import Nav from "@/components/site/Nav";
import Hero from "@/components/site/Hero";
import About from "@/components/site/About";
import Philosophy from "@/components/site/Philosophy";
import Framework from "@/components/site/Framework";
import Services from "@/components/site/Services";
import Players from "@/components/site/Players";
import Results from "@/components/site/Results";
import Coach from "@/components/site/Coach";
import PublicSlots from "@/components/site/PublicSlots";
import WaitlistForm from "@/components/site/WaitlistForm";
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
      <Players />
      <Results />
      <Coach />
      <Proof />
      <PublicSlots />
      <WaitlistForm />
      <CTA />
      <Footer />
      <StickyCTA />
    </main>
  );
};

export default Index;
