import { motion } from "framer-motion";
import img1 from "@/assets/training-1on1.jpg";
import img2 from "@/assets/training-group.jpg";

const services = [
  {
    n: "01",
    label: "1-2-1 Sessions",
    img: img1,
    lines: [
      "Private, fully tailored training built around the individual player.",
      "Maximum detail, maximum repetition — every minute focused on you.",
    ],
  },
  {
    n: "02",
    label: "Academy Small Group Sessions",
    img: img2,
    lines: [
      "High-tempo sessions with players of a similar level and ambition.",
      "Technique sharpened in realistic 1v1, 2v2 and small-sided game scenarios.",
    ],
  },
];

const Services = () => {
  return (
    <section id="services" className="relative bg-black border-b border-white/10 py-28 md:py-40">
      <div className="px-6 md:px-12 max-w-[1600px] mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="display-font text-[clamp(2.5rem,8vw,7rem)] uppercase leading-[0.9] text-white tracking-tight mb-20 md:mb-28"
        >
          Our<br /><span className="text-white/40">Services</span>
        </motion.h2>

        <div className="space-y-28 md:space-y-40">
          {services.map((s, i) => (
            <motion.article
              key={s.label}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-120px" }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-8 md:space-y-12"
            >
              <div className="flex items-baseline gap-6">
                <span className="font-mono text-xs uppercase tracking-[0.3em] text-white/40">{s.n}</span>
                <h3 className="display-font text-[clamp(2rem,6vw,5rem)] uppercase leading-[0.95] text-white tracking-tight">
                  {s.label}
                </h3>
              </div>

              <div className="w-full aspect-[16/9] md:aspect-[21/9] overflow-hidden">
                <img src={s.img} alt={s.label} className="w-full h-full object-cover" />
              </div>

              <div className="grid md:grid-cols-12 gap-8 md:gap-16 items-end">
                <div className="md:col-span-8 space-y-3">
                  {s.lines.map((l, j) => (
                    <p key={j} className="text-lg md:text-2xl text-white/80 leading-snug max-w-3xl font-light">
                      {l}
                    </p>
                  ))}
                </div>
                <div className="md:col-span-4 flex md:justify-end">
                  <a
                    href="#apply"
                    className="group inline-flex items-center gap-4 bg-white text-black px-8 py-4 text-[11px] uppercase tracking-[0.3em] font-bold hover:bg-white/85 transition-all"
                  >
                    <span>Enquire</span>
                    <span className="transition-transform group-hover:translate-x-1">→</span>
                  </a>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
