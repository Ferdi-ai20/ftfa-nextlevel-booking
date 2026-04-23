import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const Settings = () => {
  const [open, setOpen] = useState(true);
  const [closedMsg, setClosedMsg] = useState("");
  const [cal1, setCal1] = useState("");
  const [calDuo, setCalDuo] = useState("");
  const [calGroup, setCalGroup] = useState("");
  const [calTrial, setCalTrial] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase
      .from("app_settings")
      .select("waitlist_open, closed_message, calendly_url_1on1, calendly_url_duo, calendly_url_group, calendly_url_trial")
      .eq("id", 1)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setOpen(data.waitlist_open);
          setClosedMsg(data.closed_message);
          setCal1(data.calendly_url_1on1 ?? "");
          setCalDuo(data.calendly_url_duo ?? "");
          setCalGroup(data.calendly_url_group ?? "");
          setCalTrial(data.calendly_url_trial ?? "");
        }
      });
  }, []);

  const save = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("app_settings")
      .update({
        waitlist_open: open,
        closed_message: closedMsg,
        calendly_url_1on1: cal1 || null,
        calendly_url_duo: calDuo || null,
        calendly_url_group: calGroup || null,
        calendly_url_trial: calTrial || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", 1);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Saved.");
  };

  const inputCls =
    "mt-2 w-full bg-background border border-border px-3 py-2 focus:border-primary focus:outline-none text-sm";

  return (
    <div className="space-y-6 max-w-2xl">
      <header>
        <div className="text-[11px] uppercase tracking-[0.3em] text-primary">/ Settings</div>
        <h1 className="display-font text-2xl md:text-3xl uppercase mt-2">Site controls</h1>
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
      </div>

      <div className="bg-card border border-border p-6 space-y-5">
        <div>
          <div className="text-sm font-medium">Calendly booking links</div>
          <div className="text-xs text-muted-foreground">
            Optional. Per training type. Parents see a "Book via Calendly" button matching their player's training type.
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">1-on-1 URL</label>
            <input value={cal1} onChange={(e) => setCal1(e.target.value)} placeholder="https://calendly.com/..." className={inputCls} />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Duo URL</label>
            <input value={calDuo} onChange={(e) => setCalDuo(e.target.value)} placeholder="https://calendly.com/..." className={inputCls} />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Group URL</label>
            <input value={calGroup} onChange={(e) => setCalGroup(e.target.value)} placeholder="https://calendly.com/..." className={inputCls} />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Trial URL</label>
            <input value={calTrial} onChange={(e) => setCalTrial(e.target.value)} placeholder="https://calendly.com/..." className={inputCls} />
          </div>
        </div>

        <div className="text-xs text-muted-foreground border-t border-border pt-4">
          <strong>Webhook URL</strong> (paste this in Calendly → Integrations → Webhooks):
          <div className="font-mono mt-2 break-all bg-background border border-border px-3 py-2">
            https://kktuwaugntismqmvauvl.supabase.co/functions/v1/calendly-webhook
          </div>
          Subscribe to events: <code>invitee.created</code> and <code>invitee.canceled</code>.
        </div>
      </div>

      <button
        onClick={save}
        disabled={saving}
        className="bg-primary text-primary-foreground px-6 py-3 text-xs uppercase tracking-widest font-semibold hover:bg-primary/90 disabled:opacity-50"
      >
        {saving ? "Saving…" : "Save settings"}
      </button>
    </div>
  );
};

export default Settings;
