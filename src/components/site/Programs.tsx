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
    <section id="programs" className="relative py-24 md:py-32 border-b border-border">
      <div className="container">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-primary mb-4">/ 03 — Programs</div>
            <h2 className="display-font text-5xl md:text-7xl uppercase leading-[0.9]">
              Three Paths.<br/>One Standard.
            </h2>
          </div>
          <p className="text-muted-foreground max-w-sm">
            Every program is built on the same principle: only what produces real, measurable progression.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-px bg-border">
          {programs.map((p, i) => (
            <motion.article
              key={p.n}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="group bg-background hover:bg-card transition-colors flex flex-col"
            >
              <div className="relative aspect-[4/5] overflow-hidden">
                <img
                  src={p.image}
                  alt={p.title}
                  loading="lazy"
                  width={1280}
                  height={1600}
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
                <div className="absolute top-4 left-4 display-font text-5xl text-primary">{p.n}</div>
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="text-[10px] uppercase tracking-[0.2em] text-primary mb-1">{p.level}</div>
                  <h3 className="display-font text-3xl uppercase">{p.title}</h3>
                </div>
              </div>
              <div className="p-6 flex flex-col flex-1">
                <p className="text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
                <ul className="mt-6 space-y-2 flex-1">
                  {p.outcomes.map((o) => (
                    <li key={o} className="flex items-start gap-3 text-sm">
                      <span className="text-primary mt-[3px]">→</span>
                      <span>{o}</span>
                    </li>
                  ))}
                </ul>
                <a href="#booking" className="mt-8 inline-flex items-center justify-between border-t border-border pt-4 text-xs uppercase tracking-widest font-semibold group/cta">
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
