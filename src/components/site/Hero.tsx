import { motion } from "framer-motion";
import heroImage from "@/assets/hero-training.jpg.asset.json";

const Hero = () => {
  return (
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
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-black/80" />
      </div>

      {/* Headline */}
      <div className="relative z-10 h-full flex flex-col justify-end px-6 md:px-12 pb-28 md:pb-36 max-w-[1600px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
        >
          <h1 className="display-font text-[clamp(2.75rem,9vw,9rem)] uppercase leading-[0.88] text-white tracking-tight">
            Creating<br />
            Technical Players<br />
            <span className="text-white/50">Who Dominate</span><br />
            Under Pressure
          </h1>

          <div className="mt-12 flex flex-col sm:flex-row gap-3">
            <a
              href="#apply"
              className="group inline-flex items-center justify-center gap-4 bg-white text-black px-8 py-4 text-[11px] uppercase tracking-[0.3em] font-bold hover:bg-white/85 transition-all"
            >
              <span>Apply Now</span>
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </a>
            <a
              href="#framework"
              className="group inline-flex items-center justify-center gap-4 border border-white/40 text-white px-8 py-4 text-[11px] uppercase tracking-[0.3em] font-bold hover:bg-white hover:text-black transition-all"
            >
              <span>Watch Training</span>
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </a>
          </div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <a
        href="#academy"
        aria-label="Scroll down"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 group flex flex-col items-center gap-3 cursor-pointer"
      >
        <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-white/70">Scroll</span>
        <svg className="w-4 h-4 text-white/70 group-hover:text-white animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 9l-7 7-7-7" />
        </svg>
      </a>
    </section>
  );
};

export default Hero;
