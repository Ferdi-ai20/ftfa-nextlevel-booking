import { motion } from "framer-motion";
import img from "@/assets/training-group.jpg";

const About = () => {
  return (
    <section id="academy" className="relative bg-black border-b border-white/10">
      {/* Section heading */}
      <div className="px-6 md:px-12 max-w-[1600px] mx-auto pt-28 md:pt-40 pb-12 md:pb-20">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="display-font text-[clamp(3rem,10vw,9rem)] uppercase leading-[0.85] text-white tracking-tight"
        >
          FTFA<br /><span className="text-white/40">Academy</span>
        </motion.h2>
      </div>

      {/* Large image */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
        className="w-full aspect-[16/9] md:aspect-[21/9] overflow-hidden"
      >
        <img src={img} alt="FTFA training" className="w-full h-full object-cover" />
      </motion.div>

      {/* Short text */}
      <div className="px-6 md:px-12 max-w-[1600px] mx-auto py-20 md:py-32">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-2xl md:text-4xl text-white leading-[1.3] font-light max-w-4xl"
        >
          Elite football development focused on technical mastery, creativity and performing under pressure.
        </motion.p>
      </div>
    </section>
  );
};

export default About;
