export default function Loading() {
  return (
    <div className="min-h-screen pt-24 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="w-20 h-4 bg-stone-200 rounded mb-5 animate-pulse" />
        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6 md:p-8 space-y-3">
          <div className="w-1/2 h-8 bg-stone-200 rounded animate-pulse" />
          <div className="w-1/3 h-4 bg-stone-200 rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
}
