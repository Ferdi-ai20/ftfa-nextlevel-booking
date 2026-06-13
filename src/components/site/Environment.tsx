import { motion } from "framer-motion";
import img1 from "@/assets/training-1on1.jpg";
import img2 from "@/assets/training-group.jpg";
import img3 from "@/assets/training-bvo.jpg";

const cards = [
  { n: "01", title: "1-on-1 Development", desc: "Maximum attention. Maximum detail.", img: img1 },
  { n: "02", title: "Elite Small Groups", desc: "Train with players of similar level.", img: img2 },
  { n: "03", title: "Game Realism", desc: "Technique applied under pressure.", img: img3 },
];

const Environment = () => {
  return (
    <section id="environment" className="relative bg-black border-b border-white/10 py-28 md:py-40">
      <div className="px-6 md:px-12 max-w-[1600px] mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="display-font text-[clamp(2.5rem,8vw,7rem)] uppercase leading-[0.9] text-white tracking-tight mb-16 md:mb-24"
        >
          Training<br /><span className="text-white/40">Environment</span>
        </motion.h2>

        <div className="grid md:grid-cols-3 gap-4 md:gap-6">
          {cards.map((c, i) => (
            <motion.div
              key={c.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, delay: i * 0.1 }}
              className="group relative overflow-hidden bg-white/5"
            >
              <div className="aspect-[4/5] overflow-hidden">
                <img
                  src={c.img}
                  alt={c.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
              </div>
              <div className="absolute inset-0 p-8 flex flex-col justify-between">
                <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/60">{c.n}</div>
                <div>
                  <h3 className="display-font text-2xl md:text-3xl uppercase text-white leading-[0.95]">{c.title}</h3>
                  <p className="mt-3 text-sm md:text-base text-white/70 leading-snug">{c.desc}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Environment;
