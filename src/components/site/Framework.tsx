import { motion } from "framer-motion";

const framework = [
  {
    title: "Technical Toolbox",
    desc: "The cornerstone of every session. We equip players with an explosive, refined, and versatile toolbox through creative skill combinations, effective foot patterns, and advanced passing, receiving, and ball-striking practices.",
  },
  {
    title: "1v1 Dominance",
    desc: "While technical excellence is pivotal, mastering the fundamentals is just the beginning. The 1v1 duel requires an applicable understanding of when and where to use your skillset effectively — to dominate with complete control and unpredictability.",
  },
  {
    title: "Scanning",
    desc: "Awareness before action. We train the habit of scanning before, during, and after receiving — building players who always know what's around them and act with intent rather than instinct alone.",
  },
  {
    title: "Decision Making",
    desc: "Where game insight separates the good from the unstoppable. Through possession drills, tactical games, and attacking and defensive transitions, players cultivate a deeper understanding of the game's nuances.",
  },
  {
    title: "Game Realism",
    desc: "Practice that mirrors the moments that matter. Every drill is engineered to translate directly into match performance — pressure, tempo, opposition, decision speed.",
  },
];

const Framework = () => {
  return (
    <section id="framework" className="relative py-28 md:py-40 border-b border-white/10 bg-black">
      <div className="px-6 md:px-12 max-w-[1600px] mx-auto">
        <div className="grid md:grid-cols-12 gap-10 md:gap-16 mb-20">
          <div className="md:col-span-3">
            <div className="font-mono text-xs uppercase tracking-[0.3em] text-white/50">
              <span className="text-white/30 mr-2">\</span> Our Framework
            </div>
          </div>
        </div>

        <div className="border-t border-white/10">
          {framework.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, delay: i * 0.05 }}
              className="grid md:grid-cols-12 gap-6 md:gap-16 py-10 md:py-14 border-b border-white/10"
            >
              <div className="md:col-span-5">
                <h3 className="display-font text-3xl md:text-5xl uppercase leading-[0.95] text-white">
                  {f.title}
                </h3>
              </div>
              <div className="md:col-span-7">
                <p className="text-base md:text-lg text-white/70 leading-relaxed max-w-2xl">
                  {f.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Framework;
