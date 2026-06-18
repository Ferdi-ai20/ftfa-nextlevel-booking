import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";

export const useLoadingTimeout = (isLoading: boolean, timeoutMs = 5000) => {
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setTimedOut(false);
      return;
    }

    const timeout = window.setTimeout(() => setTimedOut(true), timeoutMs);
    return () => window.clearTimeout(timeout);
  }, [isLoading, timeoutMs]);

  return { timedOut, resetTimedOut: () => setTimedOut(false) };
};

export const LoadingBlock = ({ fullScreen = false }: { fullScreen?: boolean }) => (
  <div
    className={`${fullScreen ? "fixed inset-0 z-[9999] min-h-screen" : "min-h-[160px]"} grid place-items-center bg-background text-foreground px-6 py-8`}
    style={fullScreen ? { paddingTop: "max(env(safe-area-inset-top), 2rem)", paddingBottom: "max(env(safe-area-inset-bottom), 2rem)", paddingLeft: "max(env(safe-area-inset-left), 1.5rem)", paddingRight: "max(env(safe-area-inset-right), 1.5rem)" } : undefined}
    role="status"
    aria-live="polite"
  >
    <div className="flex items-center gap-3 text-sm font-medium text-foreground">
      <span className="h-5 w-5 rounded-full border-2 border-muted-foreground border-t-foreground animate-spin" aria-hidden="true" />
      <span>Laden…</span>
    </div>
  </div>
);

export const LoadingTimeoutFallback = ({
  onRetry,
  fullScreen = false,
  showSignOut = true,
}: {
  onRetry: () => void;
  fullScreen?: boolean;
  showSignOut?: boolean;
}) => {
  const { signOut } = useAuth();

  return (
    <div
      className={`${fullScreen ? "fixed inset-0 z-[9999] min-h-screen" : "min-h-[160px]"} grid place-items-center bg-background text-foreground px-4 py-8`}
      style={fullScreen ? { paddingTop: "max(env(safe-area-inset-top), 2rem)", paddingBottom: "max(env(safe-area-inset-bottom), 2rem)", paddingLeft: "max(env(safe-area-inset-left), 1rem)", paddingRight: "max(env(safe-area-inset-right), 1rem)" } : undefined}
      role="alert"
    >
      <div className="w-full max-w-md text-center space-y-4 border border-border bg-card text-card-foreground p-5 sm:p-6 shadow-elevated">
        <div className="display-font text-2xl uppercase text-foreground">Laden duurt te lang</div>
        <p className="text-sm leading-relaxed text-muted-foreground">
          De gegevens konden niet binnen 5 seconden worden geladen.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={onRetry}
            className="min-h-11 bg-primary text-primary-foreground px-4 py-3 text-xs uppercase tracking-widest font-semibold hover:bg-primary/90"
          >
            Probeer opnieuw
          </button>
          {showSignOut && (
            <button
              type="button"
              onClick={signOut}
              className="min-h-11 border border-border bg-background text-foreground px-4 py-3 text-xs uppercase tracking-widest hover:border-foreground/40"
            >
              Uitloggen
            </button>
          )}
        </div>
      </div>
    </div>
  );
};