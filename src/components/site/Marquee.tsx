const Marquee = () => {
  const items = [
    "Technique",
    "Football Vision",
    "Mentality",
    "Pro Club Prep",
    "1-on-1",
    "Discipline",
    "Performance",
    "Intensity",
  ];
  const list = [...items, ...items, ...items];

  return (
    <section className="border-y border-border bg-background overflow-hidden py-6">
      <div className="flex marquee whitespace-nowrap">
        {list.map((t, i) => (
          <div key={i} className="flex items-center gap-10 px-10 display-font text-3xl md:text-5xl uppercase">
            <span>{t}</span>
            <span className="text-primary">●</span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Marquee;
