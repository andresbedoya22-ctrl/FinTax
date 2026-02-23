"use client";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="space-y-3 rounded-2xl border border-error/30 bg-error/10 p-6 text-sm text-white">
      <p>{error.message || "Something went wrong."}</p>
      <button type="button" onClick={reset} className="rounded-lg border border-white/20 px-3 py-2">
        Retry
      </button>
    </div>
  );
}
