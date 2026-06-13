import { motion } from "framer-motion";
import coachImg from "@/assets/coach-ferdi.jpg";

const Coach = () => {
  return (
    <section id="coach" className="relative py-28 md:py-40 border-b border-white/10 bg-black overflow-hidden">
      <div className="px-6 md:px-12 max-w-[1600px] mx-auto">
        <div className="grid md:grid-cols-12 gap-10 md:gap-16 mb-16">
          <div className="md:col-span-3">
            <div className="font-mono text-xs uppercase tracking-[0.3em] text-white/50">
              <span className="text-white/30 mr-2">\</span> The Coach
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-12 gap-10 md:gap-16 items-start">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="md:col-span-6"
          >
            <h2 className="display-font text-[clamp(2.5rem,7vw,6rem)] uppercase leading-[0.9] text-white">
              "Detail is<br/>the difference."
            </h2>
            <p className="mt-10 text-base md:text-lg text-white/70 leading-relaxed max-w-xl">
              Ferdi Tarhan brings over a decade of obsession with football technique and tactics to FTFA. Having worked alongside some of the brightest young talents in the Netherlands, he has seen first-hand what it takes to become a professional — and now dedicates his work to the next generation.
            </p>
            <p className="mt-4 text-base md:text-lg text-white/70 leading-relaxed max-w-xl">
              Supporting players with the skillset required not only to reach the top, but to stay there.
            </p>
            <div className="mt-10 grid grid-cols-3 gap-px bg-white/10 max-w-md">
              {[
                { k: "10+", v: "Years Coaching" },
                { k: "200+", v: "Players Trained" },
                { k: "12", v: "To BVO" },
              ].map((s) => (
                <div key={s.v} className="bg-black p-5">
                  <div className="display-font text-3xl md:text-4xl text-white">{s.k}</div>
                  <div className="text-[10px] uppercase tracking-[0.2em] text-white/50 mt-2 font-mono">{s.v}</div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="md:col-span-6"
          >
            <div className="relative aspect-[4/5] overflow-hidden bg-white/5">
              <img
                src={coachImg}
                alt="Coach Ferdi Tarhan"
                loading="lazy"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="mt-4 flex items-baseline justify-between font-mono text-[10px] uppercase tracking-[0.25em] text-white/50">
              <span>Ferdi Tarhan</span>
              <span>Founder · Head Coach</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Coach;
