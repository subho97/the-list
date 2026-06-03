export default function Loading() {
  return (
    <div className="min-h-screen pt-24 px-4 flex items-center justify-center">
      <div className="flex flex-col items-center gap-2">
        <div className="w-6 h-6 border-2 border-amber-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-olive-light">Loading lists…</p>
      </div>
    </div>
  );
}
