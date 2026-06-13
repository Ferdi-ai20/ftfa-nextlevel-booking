import { motion } from "framer-motion";
import { clubLogos } from "./ClubLogos";

const Philosophy = () => {
  return (
    <section id="philosophy" className="relative py-28 md:py-40 border-b border-white/10 bg-black">
      <div className="px-6 md:px-12 max-w-[1600px] mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="display-font text-[clamp(2.5rem,8vw,7rem)] uppercase leading-[0.9] text-white tracking-tight mb-16 md:mb-20"
        >
          FTFA<br /><span className="text-white/40">Philosophy</span>
        </motion.h2>

        <div className="grid md:grid-cols-12 gap-8 md:gap-16 max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="md:col-span-12 space-y-6"
          >
            <p className="display-font text-2xl md:text-4xl uppercase leading-[1.1] text-white">
              We believe technical ability only matters when it can be applied under pressure.
            </p>
            <p className="text-base md:text-lg text-white/70 leading-relaxed max-w-3xl">
              Every session is designed to help players recognise, create and execute solutions in realistic football situations.
            </p>
            <p className="text-base md:text-lg text-white/70 leading-relaxed max-w-3xl">
              By combining technical mastery, decision making and game realism, we develop players who can dominate 1v1 situations, stay composed under pressure and express themselves creatively when it matters most.
            </p>
          </motion.div>
        </div>

        {/* Working with players from — right to left marquee */}
        <div className="mt-28 md:mt-36">
          <div className="font-mono text-xs uppercase tracking-[0.3em] text-white/50 text-center mb-12">
            Working With Players From
          </div>
          <div className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
            <div className="flex w-max animate-marquee gap-x-16 items-center">
              {[...clubLogos, ...clubLogos, ...clubLogos].map(({ name, Logo }, i) => (
                <Logo
                  key={`${name}-${i}`}
                  className="h-8 md:h-10 w-auto text-white/40 shrink-0"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Philosophy;
