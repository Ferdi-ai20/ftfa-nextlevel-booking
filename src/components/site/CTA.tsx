import { motion } from "framer-motion";

const CTA = () => {
  return (
    <section id="apply" className="relative py-28 md:py-44 border-b border-white/10 bg-black">
      <div className="px-6 md:px-12 max-w-[1600px] mx-auto">
        <div className="grid md:grid-cols-12 gap-10 md:gap-16">
          <div className="md:col-span-3">
            <div className="font-mono text-xs uppercase tracking-[0.3em] text-white/50">
              <span className="text-white/30 mr-2">\</span> Start
            </div>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="md:col-span-9"
          >
            <h2 className="display-font text-[clamp(3rem,11vw,10rem)] uppercase leading-[0.85] text-white">
              Start Your<br/><span className="text-white/40">Journey.</span>
            </h2>
            <p className="mt-10 text-base md:text-lg text-white/60 leading-relaxed max-w-xl">
              Spots are limited and selective. If you're ready to commit to elite standards — apply now and we'll be in touch.
            </p>
            <div className="mt-12 flex flex-col sm:flex-row gap-3">
              <a
                href="#booking"
                className="group inline-flex items-center justify-center gap-4 bg-white text-black px-10 py-5 text-[11px] uppercase tracking-[0.3em] font-bold hover:bg-white/85 transition-all"
              >
                <span>Apply Now</span>
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </a>
              <a
                href="/auth"
                className="group inline-flex items-center justify-center gap-4 border border-white/30 text-white px-10 py-5 text-[11px] uppercase tracking-[0.3em] font-bold hover:bg-white hover:text-black transition-all"
              >
                <span>Login</span>
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
