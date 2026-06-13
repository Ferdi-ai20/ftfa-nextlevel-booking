import { motion } from "framer-motion";
import heroImage from "@/assets/hero-training.jpg.asset.json";

const Hero = () => {
  return (
    <>
      {/* Full-bleed image hero */}
      <section
        id="top"
        className="relative h-screen min-h-[640px] w-full overflow-hidden bg-black"
      >
        <div className="absolute inset-0">
          <img
            src={heroImage.url}
            alt="Elite football training"
            className="w-full h-full object-cover"
            style={{ objectPosition: "center 85%" }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />
        </div>

        {/* Scroll indicator */}
        <a
          href="#intro"
          aria-label="Scroll down"
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 group flex flex-col items-center gap-3 cursor-pointer"
        >
          <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-white/70">Scroll</span>
          <svg
            className="w-4 h-4 text-white/70 group-hover:text-white animate-bounce"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 9l-7 7-7-7" />
          </svg>
        </a>
      </section>

      {/* Statement section */}
      <section
        id="intro"
        className="relative w-full bg-black text-white py-28 md:py-40 px-6 md:px-12"
      >
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-6xl mx-auto"
        >
          <h1 className="display-font text-[clamp(2.75rem,11vw,10rem)] uppercase leading-[0.85] text-white">
            Developing
            <br />
            Technical Players
            <br />
            <span className="text-white/40">Who Dominate</span>
            <br />
            The 1v1.
          </h1>
          <p className="mt-10 max-w-xl text-sm md:text-base text-white/60 leading-relaxed font-mono uppercase tracking-[0.15em]">
            A private football academy for players chasing the pro level.
            <br className="hidden md:block" />
            Technique, intelligence, mentality — nothing else.
          </p>

          <div className="mt-12 flex flex-col sm:flex-row gap-3">
            <a
              href="#booking"
              className="group inline-flex items-center justify-center gap-4 bg-white text-black px-8 py-4 text-[11px] uppercase tracking-[0.3em] font-bold hover:bg-white/85 transition-all"
            >
              <span>Book a Session</span>
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </a>
            <a
              href="#about"
              className="group inline-flex items-center justify-center gap-4 border border-white/30 text-white px-8 py-4 text-[11px] uppercase tracking-[0.3em] font-bold hover:bg-white hover:text-black transition-all"
            >
              <span>Learn More</span>
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </a>
          </div>
        </motion.div>
      </section>
    </>
  );
};

export default Hero;
