import { motion } from "framer-motion";

const framework = [
  { n: "01", title: "Technical Toolbox", desc: "Refined skill, foot patterns, ball striking." },
  { n: "02", title: "1v1 Dominance", desc: "Unpredictable. In control. Every duel." },
  { n: "03", title: "Scanning", desc: "Awareness before action." },
  { n: "04", title: "Decision Making", desc: "Read the game. Act with intent." },
  { n: "05", title: "Game Realism", desc: "Training that mirrors match pressure." },
];

const Framework = () => {
  return (
    <section id="framework" className="relative py-28 md:py-40 border-b border-white/10 bg-black">
      <div className="px-6 md:px-12 max-w-[1600px] mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="display-font text-[clamp(2.5rem,8vw,7rem)] uppercase leading-[0.9] text-white tracking-tight mb-16 md:mb-24"
        >
          Development<br /><span className="text-white/40">Framework</span>
        </motion.h2>

        <div className="border-t border-white/10">
          {framework.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, delay: i * 0.05 }}
              className="grid md:grid-cols-12 gap-6 md:gap-16 py-10 md:py-14 border-b border-white/10 items-baseline"
            >
              <div className="md:col-span-1 font-mono text-xs uppercase tracking-[0.3em] text-white/40">{f.n}</div>
              <div className="md:col-span-6">
                <h3 className="display-font text-4xl md:text-6xl uppercase leading-[0.95] text-white">{f.title}</h3>
              </div>
              <div className="md:col-span-5">
                <p className="text-base md:text-lg text-white/60 leading-snug max-w-md">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Framework;
