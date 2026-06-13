import heroImage from "@/assets/hero-training.jpg.asset.json";

const Hero = () => {
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
          style={{ objectPosition: "52% 59%" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60" />
      </div>

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
