import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type Props = {
  trainingType?: string | null;
};

type Urls = {
  "1-on-1"?: string | null;
  Duo?: string | null;
  Group?: string | null;
  Trial?: string | null;
};

const CalendlyButton = ({ trainingType }: Props) => {
  const [urls, setUrls] = useState<Urls>({});

  useEffect(() => {
    supabase
      .from("app_settings")
      .select("calendly_url_1on1, calendly_url_duo, calendly_url_group, calendly_url_trial")
      .eq("id", 1)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setUrls({
            "1-on-1": data.calendly_url_1on1,
            Duo: data.calendly_url_duo,
            Group: data.calendly_url_group,
            Trial: data.calendly_url_trial,
          });
        }
      });
  }, []);

  const url =
    (trainingType && urls[trainingType as keyof Urls]) ||
    urls["1-on-1"] ||
    urls.Duo ||
    urls.Group ||
    urls.Trial;

  if (!url) return null;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 text-[11px] uppercase tracking-widest border border-primary text-primary bg-primary/5 px-4 py-2 hover:bg-primary/10"
    >
      📅 Book via Calendly
      <span aria-hidden>→</span>
    </a>
  );
};

export default CalendlyButton;
