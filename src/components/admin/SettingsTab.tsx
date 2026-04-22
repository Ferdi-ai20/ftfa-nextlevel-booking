import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const SettingsTab = () => {
  const [open, setOpen] = useState(true);
  const [closedMsg, setClosedMsg] = useState("");
  const [slots, setSlots] = useState<string[]>([]);
  const [newSlot, setNewSlot] = useState("");

  useEffect(() => {
    supabase.from("app_settings").select("*").eq("id", 1).maybeSingle().then(({ data }) => {
      if (data) {
        setOpen(data.waitlist_open);
        setClosedMsg(data.closed_message);
        setSlots(data.active_time_slots || []);
      }
    });
  }, []);

  const save = async () => {
    const { error } = await supabase.from("app_settings").update({
      waitlist_open: open,
      closed_message: closedMsg,
      active_time_slots: slots,
      updated_at: new Date().toISOString(),
    }).eq("id", 1);
    if (error) return toast.error(error.message);
    toast.success("Settings saved.");
  };

  const addSlot = () => {
    if (!newSlot.trim()) return;
    setSlots([...slots, newSlot.trim()]);
    setNewSlot("");
  };
  const removeSlot = (s: string) => setSlots(slots.filter((x) => x !== s));

  return (
    <div className="bg-card border border-border p-6 space-y-6 max-w-2xl">
      <div>
        <div className="display-font text-xl uppercase mb-2">Waitlist status</div>
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={open} onChange={(e) => setOpen(e.target.checked)} className="w-5 h-5" />
          <span>Waitlist is {open ? "OPEN" : "CLOSED"}</span>
        </label>
      </div>

      <div>
        <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Closed message</div>
        <textarea value={closedMsg} onChange={(e) => setClosedMsg(e.target.value)} rows={3} maxLength={300}
          className="w-full bg-background border border-border px-3 py-2" />
      </div>

      <div>
        <div className="display-font text-xl uppercase mb-2">Active time slots</div>
        <p className="text-xs text-muted-foreground mb-3">Times shown on the public site for context. (Public form uses preset day+time chips.)</p>
        <div className="flex flex-wrap gap-2 mb-3">
          {slots.map((s) => (
            <span key={s} className="bg-primary/10 text-primary px-3 py-1 text-xs uppercase tracking-widest flex items-center gap-2">
              {s}
              <button onClick={() => removeSlot(s)} className="hover:text-destructive">×</button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input value={newSlot} onChange={(e) => setNewSlot(e.target.value)} placeholder="Sun 10:00"
            className="flex-1 bg-background border border-border px-3 py-2" />
          <button onClick={addSlot} className="border border-border px-4 text-xs uppercase tracking-widest hover:border-foreground/40">Add</button>
        </div>
      </div>

      <button onClick={save} className="bg-primary text-primary-foreground px-6 py-3 text-sm uppercase tracking-widest font-semibold hover:bg-primary/90">
        Save settings
      </button>
    </div>
  );
};

export default SettingsTab;
