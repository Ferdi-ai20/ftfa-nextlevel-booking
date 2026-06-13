import { motion } from "framer-motion";

const CTA = () => {
  return (
    <section id="apply" className="relative py-32 md:py-56 border-b border-white/10 bg-black">
      <div className="px-6 md:px-12 max-w-[1600px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="display-font text-[clamp(3rem,12vw,11rem)] uppercase leading-[0.85] text-white tracking-tight">
            Ready To Join<br/><span className="text-white/40">FTFA?</span>
          </h2>
          <p className="mt-10 text-lg md:text-xl text-white/60 leading-relaxed max-w-xl">
            Spots are limited and selective.
          </p>
          <div className="mt-12 flex flex-col sm:flex-row gap-3">
            <a href="#booking" className="group inline-flex items-center justify-center gap-4 bg-white text-black px-10 py-5 text-[11px] uppercase tracking-[0.3em] font-bold hover:bg-white/85 transition-all">
              <span>Apply Now</span>
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </a>
            <a href="/auth" className="group inline-flex items-center justify-center gap-4 border border-white/30 text-white px-10 py-5 text-[11px] uppercase tracking-[0.3em] font-bold hover:bg-white hover:text-black transition-all">
              <span>Login</span>
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTA;
