export default function Loading() {
  return (
    <div className="min-h-screen pt-24 md:pt-28 pb-12 px-4 max-w-4xl mx-auto">
      {/* Back link skeleton */}
      <div className="w-16 h-4 bg-stone-200 rounded mb-6 animate-pulse" />

      <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-8">
        {/* Image skeleton */}
        <div className="aspect-[3/4] bg-stone-100 rounded-xl animate-pulse" />

        {/* Content skeleton */}
        <div className="space-y-4">
          <div className="w-2/3 h-8 bg-stone-200 rounded animate-pulse" />
          <div className="w-1/3 h-5 bg-stone-200 rounded animate-pulse" />
          <div className="space-y-2 pt-4">
            <div className="w-full h-4 bg-stone-200 rounded animate-pulse" />
            <div className="w-full h-4 bg-stone-200 rounded animate-pulse" />
            <div className="w-3/4 h-4 bg-stone-200 rounded animate-pulse" />
          </div>
          <div className="flex gap-3 pt-4">
            <div className="w-32 h-10 bg-stone-200 rounded-xl animate-pulse" />
            <div className="w-32 h-10 bg-stone-200 rounded-xl animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
