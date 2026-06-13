import { motion } from "framer-motion";

const results = [
  { k: "42", v: "Goals — PEC Zwolle O16" },
  { k: "FC", v: "Utrecht Pre-Academy" },
  { k: "Pro", v: "Academy Trials" },
  { k: "Elite", v: "Player Development" },
];

const Results = () => {
  return (
    <section id="results-stats" className="relative py-28 md:py-40 border-b border-white/10 bg-black">
      <div className="px-6 md:px-12 max-w-[1600px] mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="display-font text-[clamp(2.5rem,8vw,7rem)] uppercase leading-[0.9] text-white tracking-tight mb-16 md:mb-24"
        >
          Results
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/10 border border-white/10">
          {results.map((r, i) => (
            <motion.div
              key={r.v}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.08 }}
              className="bg-black p-10 md:p-14"
            >
              <div className="display-font text-6xl md:text-8xl uppercase text-white leading-none">{r.k}</div>
              <div className="mt-6 font-mono text-[11px] uppercase tracking-[0.25em] text-white/50">{r.v}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Results;
