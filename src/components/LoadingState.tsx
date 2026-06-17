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
  <div className={`${fullScreen ? "min-h-screen" : "min-h-[160px]"} grid place-items-center bg-background text-foreground`}>
    Laden…
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
    <div className={`${fullScreen ? "min-h-screen" : "min-h-[160px]"} grid place-items-center bg-background text-foreground p-6`}>
      <div className="max-w-md text-center space-y-4 border border-border bg-card p-6">
        <div className="display-font text-2xl uppercase">Laden duurt te lang</div>
        <p className="text-sm text-muted-foreground">
          De gegevens konden niet binnen 5 seconden worden geladen.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={onRetry}
            className="bg-primary text-primary-foreground px-4 py-2 text-xs uppercase tracking-widest font-semibold hover:bg-primary/90"
          >
            Probeer opnieuw
          </button>
          {showSignOut && (
            <button
              type="button"
              onClick={signOut}
              className="border border-border px-4 py-2 text-xs uppercase tracking-widest hover:border-foreground/40"
            >
              Uitloggen
            </button>
          )}
        </div>
      </div>
    </div>
  );
};