import { useEffect, useRef, useState } from "react";

let scriptLoading: Promise<void> | null = null;
const loadTikTokScript = () => {
  if (typeof window === "undefined") return Promise.resolve();
  if (document.querySelector('script[src="https://www.tiktok.com/embed.js"]')) return Promise.resolve();
  if (scriptLoading) return scriptLoading;
  scriptLoading = new Promise<void>((resolve) => {
    const s = document.createElement("script");
    s.src = "https://www.tiktok.com/embed.js";
    s.async = true;
    s.onload = () => resolve();
    document.body.appendChild(s);
  });
  return scriptLoading;
};

interface Props {
  url: string;
  videoId: string;
}

const TikTokEmbed = ({ url, videoId }: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { rootMargin: "300px" }
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    loadTikTokScript();
  }, [visible]);

  return (
    <div ref={ref} className="bg-card border border-border min-h-[500px] flex items-center justify-center overflow-hidden">
      {visible ? (
        <blockquote
          className="tiktok-embed w-full"
          cite={url}
          data-video-id={videoId}
          style={{ maxWidth: "100%", minWidth: "100%", margin: 0 }}
        >
          <section>
            <a href={url} target="_blank" rel="noreferrer" className="text-xs text-muted-foreground p-4 block">
              View on TikTok
            </a>
          </section>
        </blockquote>
      ) : (
        <div className="text-xs uppercase tracking-widest text-muted-foreground">Loading…</div>
      )}
    </div>
  );
};

export default TikTokEmbed;
