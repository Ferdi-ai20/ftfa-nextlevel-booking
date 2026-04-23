import { motion } from "framer-motion";
import coachImg from "@/assets/coach-ferdi.jpg";

const Coach = () => {
  return (
    <section id="coach" className="relative py-24 md:py-32 border-b border-border overflow-hidden">
      <div className="container">
        <div className="grid md:grid-cols-12 gap-10 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="md:col-span-5 relative"
          >
            <div className="relative aspect-[3/4] overflow-hidden">
              <img
                src={coachImg}
                alt="Coach Ferdi Tarhan"
                loading="lazy"
                width={1080}
                height={1440}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent" />
            </div>
            <div className="absolute -bottom-4 -right-4 bg-primary text-primary-foreground p-4 hidden md:block">
              <div className="display-font text-3xl uppercase leading-none">Founder</div>
              <div className="text-[10px] uppercase tracking-widest mt-1">& Head Coach</div>
            </div>
          </motion.div>

          <div className="md:col-span-6 md:col-start-7">
            <div className="text-xs uppercase tracking-[0.3em] text-primary mb-4">/ 06 — The Coach</div>
            <h2 className="display-font text-5xl md:text-7xl uppercase leading-[0.9]">
              Ferdi<br/>Tarhan.
            </h2>
            <p className="mt-8 text-lg md:text-xl leading-relaxed">
              A decade obsessed with football technique and tactics. FTFA exists to give Dutch talent a methodology that produces real top-level players.
            </p>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              "Talent is not enough. The players who reach BVO level are the ones who train with intention every single rep. My job is to make sure that intention has the right system behind it."
            </p>

            <dl className="grid grid-cols-3 gap-px bg-border mt-12">
              {[
                { k: "10+", v: "Years Coaching" },
                { k: "200+", v: "Players Trained" },
                { k: "NL", v: "Based" },
              ].map((s) => (
                <div key={s.v} className="bg-background p-5">
                  <dt className="display-font text-3xl text-primary">{s.k}</dt>
                  <dd className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">{s.v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Coach;
