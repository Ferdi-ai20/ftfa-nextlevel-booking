import { motion } from "framer-motion";

const posts = [
  { tag: "TECHNIEK", title: "First-touch under pressure" },
  { tag: "1-ON-1", title: "Body feints + acceleration" },
  { tag: "VISIE", title: "Scanning before receiving" },
  { tag: "INTENSITY", title: "Cone work at game speed" },
  { tag: "BVO", title: "Trial-day preparation" },
  { tag: "FINISHING", title: "Cold-blooded inside the box" },
];

const Social = () => {
  return (
    <section className="relative py-24 md:py-32 border-b border-border">
      <div className="container">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-primary mb-4">/ 07 — Inside</div>
            <h2 className="display-font text-5xl md:text-7xl uppercase leading-[0.9]">
              From the<br/>Pitch.
            </h2>
          </div>
          <div className="flex gap-3">
            <a href="#contact" className="border border-border px-5 py-3 text-xs uppercase tracking-widest hover:border-primary hover:text-primary transition-colors">@FTFA · Instagram</a>
            <a href="#contact" className="border border-border px-5 py-3 text-xs uppercase tracking-widest hover:border-primary hover:text-primary transition-colors">@FTFA · TikTok</a>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
          {posts.map((p, i) => (
            <motion.a
              href="#contact"
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className="group relative aspect-[9/16] bg-card border border-border overflow-hidden block"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-secondary via-card to-background" />
              <div className="absolute inset-0 grid-bg opacity-50" />
              <div className="absolute inset-0 flex flex-col justify-between p-3">
                <div className="text-[9px] uppercase tracking-widest text-primary">{p.tag}</div>
                <div>
                  <div className="display-font text-base uppercase leading-tight">{p.title}</div>
                  <div className="mt-2 inline-flex items-center gap-1 text-[10px] uppercase tracking-widest opacity-70 group-hover:opacity-100 group-hover:text-primary transition">
                    Watch ▶
                  </div>
                </div>
              </div>
              <div className="absolute inset-0 ring-1 ring-inset ring-foreground/0 group-hover:ring-primary/60 transition" />
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Social;
