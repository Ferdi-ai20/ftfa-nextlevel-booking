import { motion } from "framer-motion";
import coachAsset from "@/assets/coach-ferdi.jpg.asset.json";
const coachImg = coachAsset.url;

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
            <p className="display-font text-2xl md:text-3xl uppercase text-white leading-[1.1] tracking-tight">
              "The environment I once missed."
            </p>

            <div className="mt-10 space-y-5 text-white/70 text-base md:text-lg leading-relaxed">
              <p>
                Ferdi was always a technical player himself — a player who wanted freedom, creativity and the space to express himself on the pitch. Growing up, that environment was not always there.
              </p>
              <p>
                FTFA Academy was created to give young players the environment he once missed.
              </p>
              <p>
                A place where technical players are encouraged to be brave, creative and dominant in 1v1 — not just to repeat drills, but to find solutions under pressure and express themselves in the modern game.
              </p>
            </div>

            <div className="mt-10 font-mono text-[10px] uppercase tracking-[0.25em] text-white/50 space-y-1">
              <div className="text-white">Ferdi Tarhan</div>
              <div>Founder · Head Coach</div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Coach;
