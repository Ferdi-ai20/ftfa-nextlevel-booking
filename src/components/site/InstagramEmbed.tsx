import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    instgrm?: { Embeds: { process: () => void } };
  }
}

let scriptLoading: Promise<void> | null = null;
const loadInstagramScript = () => {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.instgrm) return Promise.resolve();
  if (scriptLoading) return scriptLoading;
  scriptLoading = new Promise<void>((resolve) => {
    const s = document.createElement("script");
    s.src = "https://www.instagram.com/embed.js";
    s.async = true;
    s.onload = () => resolve();
    document.body.appendChild(s);
  });
  return scriptLoading;
};

interface Props {
  url: string;
}

const InstagramEmbed = ({ url }: Props) => {
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
    loadInstagramScript().then(() => {
      window.instgrm?.Embeds.process();
    });
  }, [visible, url]);

  return (
    <div ref={ref} className="bg-card border border-border min-h-[400px] flex items-center justify-center overflow-hidden">
      {visible ? (
        <blockquote
          className="instagram-media w-full"
          data-instgrm-permalink={url}
          data-instgrm-version="14"
          style={{ background: "transparent", border: 0, margin: 0, maxWidth: "100%", width: "100%" }}
        >
          <a href={url} target="_blank" rel="noreferrer" className="text-xs text-muted-foreground p-4 block">
            View on Instagram
          </a>
        </blockquote>
      ) : (
        <div className="text-xs uppercase tracking-widest text-muted-foreground">Loading…</div>
      )}
    </div>
  );
};

export default InstagramEmbed;
