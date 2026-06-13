import { motion } from "framer-motion";
import img1Asset from "@/assets/training-1on1-v2.jpg.asset.json";
const img1 = img1Asset.url;
import img2Asset from "@/assets/training-group-v2.jpg.asset.json";
const img2 = img2Asset.url;

const services = [
  {
    n: "01",
    label: "1-2-1 Sessions",
    img: img1,
    objectPosition: "center 55%",
    desc: "Private, fully tailored training built around the individual player — maximum detail, maximum repetition.",
  },
  {
    n: "02",
    label: "Academy Small Group Sessions",
    img: img2,
    objectPosition: "55% 60%",
    desc: "High-tempo sessions with players of similar level. Technique sharpened in realistic 1v1, 2v2 and small-sided games.",
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

        <div className="space-y-32 md:space-y-48">
          {services.map((s) => (
            <motion.article
              key={s.label}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-120px" }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="flex items-baseline gap-6 mb-8 md:mb-10">
                <span className="font-mono text-xs uppercase tracking-[0.3em] text-white/40">{s.n}</span>
                <h3 className="display-font text-2xl md:text-3xl uppercase leading-none text-white tracking-tight">
                  {s.label}
                </h3>
              </div>

              <div className="w-full aspect-[4/5] md:aspect-[16/10] overflow-hidden bg-white/5">
                <img
                  src={s.img}
                  alt={s.label}
                  loading="lazy"
                  className="w-full h-full object-cover"
                  style={{ objectPosition: s.objectPosition }}
                />

              </div>

              <div className="mt-10 md:mt-14 max-w-2xl">
                <p className="text-base md:text-lg text-white/70 leading-relaxed">
                  {s.desc}
                </p>
                <a
                  href="#apply"
                  className="group mt-8 inline-flex items-center gap-3 text-white text-[11px] uppercase tracking-[0.3em] font-mono border-b border-white/30 pb-2 hover:border-white transition-colors"
                >
                  <span className="transition-transform group-hover:-translate-y-0.5">↗</span>
                  <span>Enquire</span>
                </a>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;

