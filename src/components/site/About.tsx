import { motion } from "framer-motion";

const About = () => {
  return (
    <section id="about" className="relative py-28 md:py-40 border-b border-white/10 bg-black">
      <div className="px-6 md:px-12 max-w-[1600px] mx-auto">
        <div className="grid md:grid-cols-12 gap-10 md:gap-16">
          <div className="md:col-span-3">
            <div className="font-mono text-xs uppercase tracking-[0.3em] text-white/50">
              <span className="text-white/30 mr-2">\</span> Who We Are
            </div>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="md:col-span-9 space-y-6"
          >
            <p className="text-xl md:text-3xl text-white leading-[1.35] font-light">
              Welcome to <span className="display-font uppercase tracking-tight">FTFA</span> — the Ferdi Tarhan Football Academy. A private academy dedicated to helping players reach their full potential, from pre-academy all the way through to the professional game.
            </p>
            <p className="text-base md:text-lg text-white/60 leading-relaxed max-w-3xl">
              We work with some of the most talented players across the Netherlands, fostering an environment that breeds technical excellence through the detail delivered, culture created, and standards set.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default About;
