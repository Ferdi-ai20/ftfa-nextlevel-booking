import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const Settings = () => {
  const [open, setOpen] = useState(true);
  const [closedMsg, setClosedMsg] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase
      .from("app_settings")
      .select("waitlist_open, closed_message")
      .eq("id", 1)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setOpen(data.waitlist_open);
          setClosedMsg(data.closed_message);
        }
      });
  }, []);

  const save = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("app_settings")
      .update({ waitlist_open: open, closed_message: closedMsg, updated_at: new Date().toISOString() })
      .eq("id", 1);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Saved.");
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <header>
        <div className="text-[11px] uppercase tracking-[0.3em] text-primary">/ Settings</div>
        <h1 className="display-font text-4xl uppercase mt-2">Site controls</h1>
      </header>

      <div className="bg-card border border-border p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium">Waitlist open</div>
            <div className="text-xs text-muted-foreground">When closed, the public waitlist form is replaced with a message.</div>
          </div>
          <button
            onClick={() => setOpen(!open)}
            className={`px-4 py-2 text-xs uppercase tracking-widest border ${open ? "border-primary text-primary bg-primary/10" : "border-border text-muted-foreground"}`}
          >
            {open ? "Open" : "Closed"}
          </button>
        </div>

        <div>
          <label className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Closed message</label>
          <textarea
            rows={3}
            value={closedMsg}
            onChange={(e) => setClosedMsg(e.target.value)}
            className="mt-2 w-full bg-background border border-border px-3 py-2 focus:border-primary focus:outline-none"
          />
        </div>

        <button
          onClick={save}
          disabled={saving}
          className="bg-primary text-primary-foreground px-6 py-3 text-xs uppercase tracking-widest font-semibold hover:bg-primary/90 disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save settings"}
        </button>
      </div>
    </div>
  );
};

export default Settings;
