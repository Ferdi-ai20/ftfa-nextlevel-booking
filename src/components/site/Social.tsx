import { useState } from "react";
import InstagramEmbed from "./InstagramEmbed";
import TikTokEmbed from "./TikTokEmbed";
import { INSTAGRAM_POSTS, TIKTOK_POSTS, SOCIAL_HANDLES } from "@/config/socialPosts";

type Tab = "instagram" | "tiktok";

const Social = () => {
  const [tab, setTab] = useState<Tab>("instagram");

  const igEmpty = INSTAGRAM_POSTS.length === 0;
  const ttEmpty = TIKTOK_POSTS.length === 0;

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

          <div className="flex gap-2">
            <button
              onClick={() => setTab("instagram")}
              className={`px-5 py-3 text-xs uppercase tracking-widest border transition-colors ${
                tab === "instagram"
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border hover:border-foreground/50"
              }`}
            >
              Instagram
            </button>
            <button
              onClick={() => setTab("tiktok")}
              className={`px-5 py-3 text-xs uppercase tracking-widest border transition-colors ${
                tab === "tiktok"
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border hover:border-foreground/50"
              }`}
            >
              TikTok
            </button>
          </div>
        </div>

        {tab === "instagram" && (
          <>
            {igEmpty ? (
              <EmptyState
                platform="Instagram"
                handle={SOCIAL_HANDLES.instagram}
                profileUrl={`https://instagram.com/${SOCIAL_HANDLES.instagram}`}
                hint="Add Instagram post URLs to src/config/socialPosts.ts"
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {INSTAGRAM_POSTS.map((url) => (
                  <InstagramEmbed key={url} url={url} />
                ))}
              </div>
            )}
          </>
        )}

        {tab === "tiktok" && (
          <>
            {ttEmpty ? (
              <EmptyState
                platform="TikTok"
                handle={SOCIAL_HANDLES.tiktok}
                profileUrl={`https://tiktok.com/@${SOCIAL_HANDLES.tiktok}`}
                hint="Add TikTok video URLs to src/config/socialPosts.ts"
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {TIKTOK_POSTS.map((p) => (
                  <TikTokEmbed key={p.videoId} url={p.url} videoId={p.videoId} />
                ))}
              </div>
            )}
          </>
        )}

        <div className="mt-10 flex flex-wrap gap-3 justify-center">
          <a
            href={`https://instagram.com/${SOCIAL_HANDLES.instagram}`}
            target="_blank"
            rel="noreferrer"
            className="border border-border px-5 py-3 text-xs uppercase tracking-widest hover:border-primary hover:text-primary transition-colors"
          >
            Follow @{SOCIAL_HANDLES.instagram} · Instagram
          </a>
          <a
            href={`https://tiktok.com/@${SOCIAL_HANDLES.tiktok}`}
            target="_blank"
            rel="noreferrer"
            className="border border-border px-5 py-3 text-xs uppercase tracking-widest hover:border-primary hover:text-primary transition-colors"
          >
            Follow @{SOCIAL_HANDLES.tiktok} · TikTok
          </a>
        </div>
      </div>
    </section>
  );
};

const EmptyState = ({
  platform,
  handle,
  profileUrl,
  hint,
}: {
  platform: string;
  handle: string;
  profileUrl: string;
  hint: string;
}) => (
  <div className="border border-dashed border-border bg-card p-12 text-center">
    <div className="display-font text-3xl uppercase">{platform} feed ready</div>
    <p className="text-muted-foreground mt-3 max-w-md mx-auto text-sm">
      {hint}. Posts will appear here as a playable grid.
    </p>
    <a
      href={profileUrl}
      target="_blank"
      rel="noreferrer"
      className="mt-6 inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-3 text-xs uppercase tracking-widest font-semibold hover:bg-primary/90 transition-colors"
    >
      Visit @{handle} →
    </a>
  </div>
);

export default Social;
