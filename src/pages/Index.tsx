import Nav from "@/components/site/Nav";
import Hero from "@/components/site/Hero";
import Marquee from "@/components/site/Marquee";
import About from "@/components/site/About";
import Programs from "@/components/site/Programs";
import Booking from "@/components/site/Booking";
import SundaySlot from "@/components/site/SundaySlot";
import Proof from "@/components/site/Proof";
import Coach from "@/components/site/Coach";
import Social from "@/components/site/Social";
import CTA from "@/components/site/CTA";
import Footer from "@/components/site/Footer";
import StickyCTA from "@/components/site/StickyCTA";

const Index = () => {
  return (
    <main className="bg-background text-foreground">
      <Nav />
      <Hero />
      <Marquee />
      <About />
      <Programs />
      <Coach />
      <Booking />
      <SundaySlot />
      <Proof />
      <Social />
      <CTA />
      <Footer />
      <StickyCTA />
    </main>
  );
};

export default Index;
