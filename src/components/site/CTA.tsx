import { motion } from "framer-motion";

const CTA = () => {
  return (
    <section id="apply" className="relative py-32 md:py-48 border-b border-border overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-30" />
      <div className="absolute inset-0 bg-gradient-radial" />
      <div className="container relative text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="text-xs uppercase tracking-[0.3em] text-primary mb-6">/ 08 — Final Word</div>
          <h2 className="display-font text-[clamp(3rem,10vw,9rem)] uppercase leading-[0.85]">
            Only for<br/>players who are<br/><span className="text-primary">serious.</span>
          </h2>
          <p className="mt-8 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            If you want entertainment, look elsewhere. If you want the next level — apply.
          </p>
          <a
            href="#booking"
            className="mt-10 inline-flex items-center gap-6 bg-primary text-primary-foreground px-10 py-5 text-sm uppercase tracking-widest font-semibold hover:bg-primary/90 transition-all group shadow-glow"
          >
            <span>Apply Now</span>
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default CTA;
