import { motion } from "framer-motion";
import { clubLogos } from "./ClubLogos";
const testimonials = [
  {
    quote: "Ferdi changed how I think about the game. The technical detail is on another level — within 6 months I was invited to BVO trials.",
    name: "Daan V.",
    age: 16,
    moved: "AZ Alkmaar Youth",
  },
  {
    quote: "We tried multiple academies. FTFA is the only one that delivers what they promise. Our son's progress is undeniable.",
    name: "Parent of Yusuf",
    age: 13,
    moved: "Feyenoord Academy",
  },
  {
    quote: "The 1-on-1 sessions exposed every weakness in my game and built them into strengths. No filler. Pure work.",
    name: "Marco K.",
    age: 19,
    moved: "FC Utrecht O21",
  },
];



const Proof = () => {
  return (
    <section id="results" className="relative py-24 md:py-32 border-b border-border">
      <div className="container">
        <div className="text-xs uppercase tracking-[0.3em] text-primary mb-4">/ 05 — Proof</div>
        <h2 className="display-font text-5xl md:text-7xl uppercase leading-[0.9] max-w-4xl">
          The Work<br/><span className="text-stroke">Speaks</span> Loudest.
        </h2>

        <div className="grid md:grid-cols-3 gap-px bg-border mt-16">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="bg-background p-8 flex flex-col"
            >
              <div className="display-font text-6xl text-primary leading-none">"</div>
              <p className="text-base md:text-lg leading-relaxed mt-2 flex-1">{t.quote}</p>
              <div className="mt-8 pt-6 border-t border-border">
                <div className="font-semibold">{t.name}</div>
                <div className="text-xs uppercase tracking-widest text-muted-foreground mt-1">Age {t.age} · Now at {t.moved}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Club logos strip */}
        <div className="mt-20">
          <div className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground text-center mb-8">
            Players placed at
          </div>
          <div className="flex flex-wrap justify-center items-center gap-x-10 gap-y-6">
            {clubLogos.map(({ name, Logo }) => (
              <Logo
                key={name}
                className="h-9 w-auto text-muted-foreground/70 hover:text-foreground transition-colors"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Proof;
