import { motion } from "framer-motion";

const About = () => {
  return (
    <section id="about" className="relative py-24 md:py-32 border-b border-border">
      <div className="container">
        <div className="grid md:grid-cols-12 gap-10 md:gap-16">
          <div className="md:col-span-4">
            <div className="text-xs uppercase tracking-[0.3em] text-primary mb-4">/ 02 — The Academy</div>
            <h2 className="display-font text-5xl md:text-7xl uppercase leading-[0.9]">
              Built for<br/>the<br/><span className="text-primary">Serious.</span>
            </h2>
          </div>
          <div className="md:col-span-7 md:col-start-6 space-y-8">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7 }}
              className="text-xl md:text-2xl text-foreground leading-relaxed"
            >
              FTFA is the football academy of <span className="text-primary">Ferdi Tarhan</span> — built around one obsession: developing technical execution and intuitive game intelligence at the highest level.
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-base md:text-lg text-muted-foreground leading-relaxed"
            >
              Our methodology is unique in the Netherlands. We combine high-level techniektraining with intuïtieve voetbalvisie — a system that produces players who think, decide, and execute faster than the rest. No fluff. No filler. Only what makes you better.
            </motion.p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-px bg-border mt-12">
              {[
                { t: "Techniek", d: "Premium technical detail work" },
                { t: "Visie", d: "Intuitive decision-making system" },
                { t: "Mentaliteit", d: "Pro-level discipline & focus" },
              ].map((b) => (
                <div key={b.t} className="bg-background p-6">
                  <div className="display-font text-2xl uppercase">{b.t}</div>
                  <div className="text-xs text-muted-foreground mt-2 uppercase tracking-wider">{b.d}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
