import { motion } from "framer-motion";
import img1 from "@/assets/training-1on1.jpg";
import img2 from "@/assets/training-group.jpg";
import img3 from "@/assets/training-bvo.jpg";

const programs = [
  {
    n: "01",
    title: "1-on-1 Training",
    level: "Premium · Personalized",
    desc: "Fully tailored sessions. Every drill, every rep — built around your weaknesses and ambitions.",
    outcomes: ["Technical mastery", "Tactical awareness", "Personal video analysis"],
    image: img1,
  },
  {
    n: "02",
    title: "Small Group Training",
    level: "Elite Group · Max 6",
    desc: "Train at game speed with players of equal level. Pressure. Tempo. Standards.",
    outcomes: ["Game-speed execution", "1v1 & small-sided intensity", "Peer-level competition"],
    image: img2,
  },
  {
    n: "03",
    title: "Pro Club Preparation",
    level: "Pro Pathway · Selective",
    desc: "Multi-week program for players ready to step into professional youth academies. Football vision, mentality, and pro-club methodology.",
    outcomes: ["Football vision & game IQ", "Mentality & resilience training", "Trial-day preparation"],
    image: img3,
  },
];

const Programs = () => {
  return (
    <section id="programs" className="relative py-28 md:py-40 border-b border-white/10 bg-black">
      <div className="px-6 md:px-12 max-w-[1600px] mx-auto">
        <div className="grid md:grid-cols-3 gap-px bg-white/10">
          {programs.map((p, i) => (
            <motion.article
              key={p.n}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="group bg-black flex flex-col"
            >
              <div className="relative aspect-[4/5] overflow-hidden">
                <img
                  src={p.image}
                  alt={p.title}
                  loading="lazy"
                  width={1280}
                  height={1600}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                <div className="absolute top-5 left-5 font-mono text-[10px] uppercase tracking-[0.3em] text-white/70">{p.n}</div>
                <div className="absolute bottom-5 left-5 right-5">
                  <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/70 mb-2">{p.level}</div>
                  <h3 className="display-font text-3xl md:text-4xl uppercase text-white">{p.title}</h3>
                </div>
              </div>
              <div className="p-6 md:p-8 flex flex-col flex-1">
                <p className="text-sm md:text-base text-white/70 leading-relaxed">{p.desc}</p>
                <ul className="mt-6 space-y-3 flex-1">
                  {p.outcomes.map((o) => (
                    <li key={o} className="flex items-start gap-3 text-sm text-white/80">
                      <span className="text-white/40 mt-[3px]">→</span>
                      <span>{o}</span>
                    </li>
                  ))}
                </ul>
                <a href="#booking" className="mt-8 inline-flex items-center justify-between border-t border-white/10 pt-4 font-mono text-[10px] uppercase tracking-[0.3em] text-white/70 hover:text-white group/cta">
                  <span>Reserve Spot</span>
                  <span className="transition-transform group-hover/cta:translate-x-1">→</span>
                </a>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Programs;
