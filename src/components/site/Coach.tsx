import { motion } from "framer-motion";
import coachImg from "@/assets/coach-ferdi.jpg";

const Coach = () => {
  return (
    <section id="coach" className="relative py-28 md:py-40 border-b border-white/10 bg-black overflow-hidden">
      <div className="px-6 md:px-12 max-w-[1600px] mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="display-font text-[clamp(2.5rem,8vw,7rem)] uppercase leading-[0.9] text-white tracking-tight mb-16 md:mb-24"
        >
          The Coach
        </motion.h2>

        <div className="grid md:grid-cols-12 gap-10 md:gap-16 items-start">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="md:col-span-7"
          >
            <div className="relative aspect-[4/5] overflow-hidden bg-white/5">
              <img src={coachImg} alt="Coach Ferdi Tarhan" loading="lazy" className="w-full h-full object-cover" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="md:col-span-5 md:pt-10"
          >
            <p className="display-font text-3xl md:text-5xl uppercase text-white leading-[1] tracking-tight">
              "Detail is the difference."
            </p>
            <div className="mt-10 font-mono text-[10px] uppercase tracking-[0.25em] text-white/50 space-y-1">
              <div className="text-white">Ferdi Tarhan</div>
              <div>Founder · Head Coach</div>
            </div>

            <div className="mt-12 grid grid-cols-3 gap-px bg-white/10">
              {[
                { k: "10+", v: "Years" },
                { k: "200+", v: "Players" },
                { k: "12", v: "To BVO" },
              ].map((s) => (
                <div key={s.v} className="bg-black p-5">
                  <div className="display-font text-3xl md:text-4xl text-white">{s.k}</div>
                  <div className="text-[10px] uppercase tracking-[0.2em] text-white/50 mt-2 font-mono">{s.v}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Coach;
