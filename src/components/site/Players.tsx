import { motion } from "framer-motion";
import img1 from "@/assets/training-1on1.jpg";
import img2 from "@/assets/training-group.jpg";
import img3 from "@/assets/training-bvo.jpg";
import img4 from "@/assets/proof-signing.jpg";

const players = [
  { name: "Player 01", club: "FC Utrecht", img: img1 },
  { name: "Player 02", club: "NAC Breda", img: img2 },
  { name: "Player 03", club: "PEC Zwolle", img: img3 },
  { name: "Player 04", club: "Go Ahead Eagles", img: img4 },
];

const Players = () => {
  return (
    <section id="players" className="relative py-28 md:py-40 border-b border-white/10 bg-black">
      <div className="px-6 md:px-12 max-w-[1600px] mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="display-font text-[clamp(2.5rem,8vw,7rem)] uppercase leading-[0.9] text-white tracking-tight mb-16 md:mb-24"
        >
          Players
        </motion.h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
          {players.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.7, delay: i * 0.08 }}
              className="group"
            >
              <div className="relative aspect-[3/4] overflow-hidden bg-white/5">
                <img src={p.img} alt={p.club} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              </div>
              <div className="mt-3 flex items-baseline justify-between font-mono text-[10px] uppercase tracking-[0.25em] text-white/50">
                <span className="text-white/70">{p.club}</span>
                <span>{String(i + 1).padStart(2, "0")}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Players;
