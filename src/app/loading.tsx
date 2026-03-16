export default function Loading() {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <div className="flex items-center gap-3">
        <div className="w-5 h-5 border-2 border-rust border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-mono text-text-sec">Loading...</span>
      </div>
    </div>
  );
}
