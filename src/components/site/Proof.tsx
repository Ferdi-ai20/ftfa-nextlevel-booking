import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const testimonials = [
  {
    quote: "Over the last year, working with FTFA has really helped my son progress. Ferdi's level of technical detail and energy is unmatched. He breaks down complex skills into digestible coaching cues that can be applied into game situations.",
    name: "Parent of Daan",
    club: "AZ Alkmaar Youth",
  },
  {
    quote: "We tried multiple academies. FTFA is the only one that delivers what they promise. The progress is undeniable — and the standards never drop.",
    name: "Parent of Yusuf",
    club: "Feyenoord Academy",
  },
  {
    quote: "The 1-on-1 sessions exposed every weakness in my game and built them into strengths. No filler. Pure work.",
    name: "Marco K., 19",
    club: "FC Utrecht O21",
  },
];

const Proof = () => {
  const [i, setI] = useState(0);
  const t = testimonials[i];
  const next = () => setI((p) => (p + 1) % testimonials.length);
  const prev = () => setI((p) => (p - 1 + testimonials.length) % testimonials.length);

  return (
    <section id="results" className="relative py-28 md:py-40 border-b border-white/10 bg-black">
      <div className="px-6 md:px-12 max-w-[1600px] mx-auto">
        <div className="grid md:grid-cols-12 gap-10 md:gap-16 mb-12">
          <div className="md:col-span-3">
            <div className="font-mono text-xs uppercase tracking-[0.3em] text-white/50">
              <span className="text-white/30 mr-2">\</span> Testimonials
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-12 gap-10 md:gap-16">
          <div className="md:col-span-9 md:col-start-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="display-font text-7xl md:text-9xl text-white/20 leading-none mb-4">"</div>
                <blockquote className="border-l border-white/30 pl-6 md:pl-10">
                  <p className="text-xl md:text-3xl text-white leading-[1.4] font-light max-w-4xl">
                    {t.quote}
                  </p>
                </blockquote>
                <div className="mt-10 pl-6 md:pl-10">
                  <div className="display-font text-2xl uppercase text-white">{t.name}</div>
                  <div className="font-mono text-[11px] uppercase tracking-[0.25em] text-white/50 mt-1">{t.club}</div>
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="flex gap-3 mt-12 pl-6 md:pl-10">
              <button
                onClick={prev}
                aria-label="Previous"
                className="w-14 h-14 rounded-full border border-white/20 text-white hover:bg-white hover:text-black transition-colors flex items-center justify-center"
              >
                ←
              </button>
              <button
                onClick={next}
                aria-label="Next"
                className="w-14 h-14 rounded-full border border-white/20 text-white hover:bg-white hover:text-black transition-colors flex items-center justify-center"
              >
                →
              </button>
              <div className="ml-auto self-center font-mono text-[10px] uppercase tracking-[0.25em] text-white/40">
                {String(i + 1).padStart(2, "0")} / {String(testimonials.length).padStart(2, "0")}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Proof;
