import Nav from "@/components/site/Nav";
import Hero from "@/components/site/Hero";
import About from "@/components/site/About";
import Philosophy from "@/components/site/Philosophy";
import Framework from "@/components/site/Framework";
import Services from "@/components/site/Services";
import Coach from "@/components/site/Coach";
import PublicSlots from "@/components/site/PublicSlots";
import Proof from "@/components/site/Proof";
import CTA from "@/components/site/CTA";
import Footer from "@/components/site/Footer";
import StickyCTA from "@/components/site/StickyCTA";
import Reveal from "@/components/site/Reveal";

const Index = () => {
  return (
    <main className="bg-background text-foreground">
      <Nav />
      <Hero />
      <Reveal><About /></Reveal>
      <Reveal><Philosophy /></Reveal>
      <Reveal><Framework /></Reveal>
      <Reveal><Services /></Reveal>
      <Reveal><Coach /></Reveal>
      <Reveal><Proof /></Reveal>
      <Reveal><PublicSlots /></Reveal>
      <Reveal><CTA /></Reveal>
      <Footer />
      <StickyCTA />
    </main>
  );
};

export default Index;
