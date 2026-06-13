import { motion } from "framer-motion";
import { clubLogos } from "./ClubLogos";

const Philosophy = () => {
  return (
    <section id="philosophy" className="relative py-28 md:py-40 border-b border-white/10 bg-black">
      <div className="px-6 md:px-12 max-w-[1600px] mx-auto">
        <div className="grid md:grid-cols-12 gap-10 md:gap-16">
          <div className="md:col-span-3">
            <div className="font-mono text-xs uppercase tracking-[0.3em] text-white/50">
              <span className="text-white/30 mr-2">\</span> Our Philosophy
            </div>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="md:col-span-9"
          >
            <h2 className="display-font text-[clamp(2rem,5vw,4rem)] uppercase leading-[1.05] text-white max-w-4xl">
              "Technical mastery is only valuable when it can be applied under pressure."
            </h2>
            <p className="mt-10 text-base md:text-lg text-white/70 leading-relaxed max-w-3xl">
              At FTFA, ball mastery is the heart of our coaching philosophy — empowering players with the technical toolbox needed to dominate duels, remain confident in possession, and find creative solutions to eliminate pressure. These are the hallmarks of football's greatest mavericks.
            </p>
            <p className="mt-4 text-base md:text-lg text-white/70 leading-relaxed max-w-3xl">
              We cultivate these skills through a relentless practice culture, where purposeful repetition meets explosive endurance — delivered with the level of detail found only at the pinnacle of academy football.
            </p>
          </motion.div>
        </div>

        {/* Working with players from */}
        <div className="mt-28 md:mt-36">
          <div className="font-mono text-xs uppercase tracking-[0.3em] text-white/50 text-center mb-12">
            <span className="text-white/30 mr-2">\</span> Working With Players From
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
