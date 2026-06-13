import { motion } from "framer-motion";

const About = () => {
  return (
    <section id="academy" className="relative bg-black border-b border-white/10">
      <div className="px-6 md:px-12 max-w-[1400px] mx-auto py-28 md:py-48 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="display-font text-[clamp(2.25rem,6vw,5.5rem)] uppercase leading-[0.95] text-white tracking-tight"
        >
          Built For Players<br />
          <span className="text-white/40">Who Want More.</span>
        </motion.h2>
      </div>
    </section>
  );
};

export default About;
