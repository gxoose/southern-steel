'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <h2 className="font-display text-xl text-text mb-2">Something went wrong</h2>
        <p className="text-sm text-text-sec font-mono mb-6">
          {error.message || 'An unexpected error occurred.'}
        </p>
        <button
          onClick={reset}
          className="btn-rust text-sm px-6 py-2.5 rounded-md"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
