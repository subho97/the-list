export default function Loading() {
  return (
    <div className="min-h-screen pt-24 md:pt-28 pb-12 px-4 max-w-5xl mx-auto">
      {/* Back link skeleton */}
      <div className="w-20 h-4 bg-stone-200 rounded mb-5 animate-pulse" />

      {/* Header skeleton */}
      <div className="mb-8">
        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6 md:p-8 space-y-4">
          <div className="w-1/3 h-7 bg-stone-200 rounded animate-pulse" />
          <div className="w-2/3 h-4 bg-stone-200 rounded animate-pulse" />
          <div className="flex gap-4">
            <div className="w-24 h-3 bg-stone-200 rounded animate-pulse" />
            <div className="w-24 h-3 bg-stone-200 rounded animate-pulse" />
            <div className="w-20 h-3 bg-stone-200 rounded animate-pulse" />
          </div>
        </div>
      </div>

      {/* Card grid skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden animate-pulse">
            <div className="aspect-[3/4] bg-stone-100" />
            <div className="p-3 space-y-2">
              <div className="w-3/4 h-4 bg-stone-200 rounded" />
              <div className="w-1/2 h-3 bg-stone-100 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
