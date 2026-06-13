import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const testimonials = [
  {
    quote: "FTFA's level of technical detail is unmatched. The progress is undeniable.",
    name: "Parent of Daan",
    club: "AZ Alkmaar Youth",
  },
  {
    quote: "The only academy that delivers what they promise. Standards never drop.",
    name: "Parent of Yusuf",
    club: "Feyenoord Academy",
  },
  {
    quote: "Every weakness exposed. Every weakness built into a strength. Pure work.",
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
    <section id="testimonials" className="relative py-28 md:py-40 border-b border-white/10 bg-black">
      <div className="px-6 md:px-12 max-w-[1600px] mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="display-font text-[clamp(2.5rem,8vw,7rem)] uppercase leading-[0.9] text-white tracking-tight mb-16 md:mb-24"
        >
          Testimonials
        </motion.h2>

        <div className="max-w-5xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="display-font text-7xl md:text-9xl text-white/20 leading-none mb-4">"</div>
              <blockquote>
                <p className="display-font text-3xl md:text-6xl uppercase text-white leading-[1.05] tracking-tight">
                  {t.quote}
                </p>
              </blockquote>
              <div className="mt-10">
                <div className="font-mono text-xs uppercase tracking-[0.25em] text-white">{t.name}</div>
                <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/50 mt-1">{t.club}</div>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="flex gap-3 mt-12">
            <button onClick={prev} aria-label="Previous" className="w-14 h-14 rounded-full border border-white/20 text-white hover:bg-white hover:text-black transition-colors flex items-center justify-center">←</button>
            <button onClick={next} aria-label="Next" className="w-14 h-14 rounded-full border border-white/20 text-white hover:bg-white hover:text-black transition-colors flex items-center justify-center">→</button>
            <div className="ml-auto self-center font-mono text-[10px] uppercase tracking-[0.25em] text-white/40">
              {String(i + 1).padStart(2, "0")} / {String(testimonials.length).padStart(2, "0")}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Proof;
