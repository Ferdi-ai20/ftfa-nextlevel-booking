import { useEffect, useState } from "react";
import heroImage from "@/assets/hero-training.jpg.asset.json";

const STORAGE_KEY = "hero-position-v1";

const Hero = () => {
  const [open, setOpen] = useState(false);
  const [posX, setPosX] = useState(50);
  const [posY, setPosY] = useState(85);
  const [scale, setScale] = useState(100);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const v = JSON.parse(saved);
        if (typeof v.posX === "number") setPosX(v.posX);
        if (typeof v.posY === "number") setPosY(v.posY);
        if (typeof v.scale === "number") setScale(v.scale);
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ posX, posY, scale }));
    } catch {}
  }, [posX, posY, scale]);

  return (
    <section
      id="top"
      className="relative h-screen min-h-[640px] w-full overflow-hidden bg-black"
    >
      <div className="absolute inset-0">
        <img
          src={heroImage.url}
          alt="Elite football training"
          className="w-full h-full object-cover"
          style={{
            objectPosition: `${posX}% ${posY}%`,
            transform: `scale(${scale / 100})`,
            transformOrigin: `${posX}% ${posY}%`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60" />
      </div>

      {/* Dev position panel */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="absolute top-20 right-4 z-30 px-3 py-2 bg-black/70 backdrop-blur border border-white/20 text-white text-[10px] uppercase tracking-[0.2em] font-mono hover:bg-black/90"
      >
        {open ? "Close" : "Position"}
      </button>

      {open && (
        <div className="absolute top-32 right-4 z-30 w-72 p-4 bg-black/85 backdrop-blur border border-white/20 text-white font-mono text-[11px] space-y-4">
          <div>
            <div className="flex justify-between mb-1 uppercase tracking-[0.2em] text-white/70">
              <span>Horizontal</span>
              <span>{posX}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={posX}
              onChange={(e) => setPosX(Number(e.target.value))}
              className="w-full accent-white"
            />
          </div>
          <div>
            <div className="flex justify-between mb-1 uppercase tracking-[0.2em] text-white/70">
              <span>Vertical</span>
              <span>{posY}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={posY}
              onChange={(e) => setPosY(Number(e.target.value))}
              className="w-full accent-white"
            />
          </div>
          <div>
            <div className="flex justify-between mb-1 uppercase tracking-[0.2em] text-white/70">
              <span>Zoom</span>
              <span>{scale}%</span>
            </div>
            <input
              type="range"
              min={100}
              max={250}
              value={scale}
              onChange={(e) => setScale(Number(e.target.value))}
              className="w-full accent-white"
            />
          </div>
          <button
            onClick={() => { setPosX(50); setPosY(85); setScale(100); }}
            className="w-full py-2 border border-white/30 hover:bg-white/10 uppercase tracking-[0.2em]"
          >
            Reset
          </button>
          <p className="text-[10px] text-white/50 leading-relaxed">
            Settings opgeslagen in je browser. Zeg "lock hero" om deze waarden vast te zetten in de code.
          </p>
        </div>
      )}

      {/* Scroll indicator */}
      <a
        href="#academy"
        aria-label="Scroll down"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 group flex flex-col items-center gap-3 cursor-pointer"
      >
        <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-white/70">Scroll</span>
        <svg className="w-4 h-4 text-white/70 group-hover:text-white animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 9l-7 7-7-7" />
        </svg>
      </a>
    </section>
  );
};

export default Hero;
