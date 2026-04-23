import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type Profile = {
  id: string;
  full_name: string | null;
  phone: string | null;
  created_at: string;
  email?: string | null;
};

type Player = {
  id: string;
  player_name: string;
  parent_user_id: string | null;
  email: string | null;
  phone: string | null;
};

const Approvals = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [unlinkedPlayers, setUnlinkedPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [linking, setLinking] = useState<Profile | null>(null);
  const [viewing, setViewing] = useState<Profile | null>(null);
  const [search, setSearch] = useState("");

  const load = async () => {
    setLoading(true);
    // All profiles
    const { data: profs } = await supabase
      .from("profiles")
      .select("id, full_name, phone, created_at")
      .order("created_at", { ascending: false });

    // All players (admins can read all)
    const { data: pls } = await supabase
      .from("players")
      .select("id, player_name, parent_user_id, email, phone")
      .order("player_name");

    const linkedIds = new Set((pls ?? []).filter((p) => p.parent_user_id).map((p) => p.parent_user_id!));
    const unlinkedProfiles = (profs ?? []).filter((p) => !linkedIds.has(p.id));
    setProfiles(unlinkedProfiles as Profile[]);
    setUnlinkedPlayers(((pls ?? []) as Player[]).filter((p) => !p.parent_user_id));
    setLoading(false);
  };

  useEffect(() => {
    void load();
  }, []);

  const linkToPlayer = async (playerId: string) => {
    if (!linking) return;
    const { error } = await supabase
      .from("players")
      .update({ parent_user_id: linking.id })
      .eq("id", playerId);
    if (error) return toast.error(error.message);
    toast.success("Linked.");
    setLinking(null);
    void load();
  };

  const createPlayerFromProfile = async () => {
    if (!linking) return;
    const { error } = await supabase.from("players").insert({
      player_name: linking.full_name || "New player",
      parent_name: linking.full_name,
      phone: linking.phone,
      parent_user_id: linking.id,
    });
    if (error) return toast.error(error.message);
    toast.success("Player created and linked.");
    setLinking(null);
    void load();
  };

  const filteredPlayers = useMemo(
    () =>
      unlinkedPlayers.filter((p) =>
        [p.player_name, p.email, p.phone].filter(Boolean).some((v) => v!.toLowerCase().includes(search.toLowerCase()))
      ),
    [unlinkedPlayers, search]
  );

  return (
    <div className="space-y-6">
      <header>
        <div className="text-[11px] uppercase tracking-[0.3em] text-primary">/ Approvals</div>
        <h1 className="display-font text-4xl uppercase mt-2">Pending parent accounts</h1>
        <p className="text-sm text-muted-foreground mt-2">
          Parents who signed up but are not yet linked to a player. Link them to grant dashboard access.
        </p>
      </header>

      {loading ? (
        <div className="text-sm text-muted-foreground">Loading…</div>
      ) : profiles.length === 0 ? (
        <div className="border border-border bg-card p-6 text-sm text-muted-foreground">
          All registered parents are linked to a player. ✓
        </div>
      ) : (
        <div className="border border-border bg-card divide-y divide-border">
          {profiles.map((p) => (
            <div key={p.id} className="p-4 grid md:grid-cols-12 gap-3 items-center">
              <div className="md:col-span-4">
                <div className="font-medium">{p.full_name || <span className="text-muted-foreground">No name</span>}</div>
                <div className="text-xs text-muted-foreground font-mono break-all">{p.id}</div>
              </div>
              <div className="md:col-span-3 text-sm">{p.phone || <span className="text-muted-foreground">—</span>}</div>
              <div className="md:col-span-3 text-xs text-muted-foreground">
                Signed up {new Date(p.created_at).toLocaleDateString()}
              </div>
              <div className="md:col-span-2 flex justify-end">
                <button
                  onClick={() => setLinking(p)}
                  className="text-[10px] uppercase tracking-widest bg-primary text-primary-foreground px-3 py-2 hover:bg-primary/90"
                >
                  Link to player…
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {linking && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur grid place-items-center p-4 overflow-auto">
          <div className="bg-card border border-border w-full max-w-2xl p-6 space-y-4 my-10">
            <div className="flex items-center justify-between">
              <div className="display-font text-2xl uppercase">Link account</div>
              <button
                onClick={() => setLinking(null)}
                className="text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground"
              >
                ✕ Close
              </button>
            </div>
            <div className="text-sm">
              Linking parent: <strong>{linking.full_name || "(no name)"}</strong>
              {linking.phone && <span className="text-muted-foreground"> · {linking.phone}</span>}
            </div>

            <button
              onClick={createPlayerFromProfile}
              className="w-full bg-primary text-primary-foreground py-3 text-xs uppercase tracking-widest font-semibold hover:bg-primary/90"
            >
              + Create new player from this account
            </button>

            <div className="border-t border-border pt-4">
              <label className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                Or link to existing player
              </label>
              <input
                placeholder="Search players…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="mt-2 w-full bg-background border border-border px-3 py-2 focus:border-primary focus:outline-none text-sm"
              />
              <div className="mt-3 max-h-72 overflow-auto border border-border divide-y divide-border">
                {filteredPlayers.length === 0 ? (
                  <div className="p-3 text-xs text-muted-foreground">No unlinked players match.</div>
                ) : (
                  filteredPlayers.map((pl) => (
                    <button
                      key={pl.id}
                      onClick={() => linkToPlayer(pl.id)}
                      className="w-full text-left p-3 hover:bg-muted/30 flex items-center justify-between gap-2"
                    >
                      <div>
                        <div className="text-sm font-medium">{pl.player_name}</div>
                        <div className="text-xs text-muted-foreground">
                          {[pl.email, pl.phone].filter(Boolean).join(" · ")}
                        </div>
                      </div>
                      <span className="text-[10px] uppercase tracking-widest text-primary">Link →</span>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Approvals;
