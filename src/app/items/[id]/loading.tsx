export default function Loading() {
  return (
    <div className="min-h-screen pt-24 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Back link skeleton */}
        <div className="w-20 h-4 bg-stone-200 rounded mb-5 animate-pulse" />
        
        {/* Hero skeleton */}
        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden md:flex">
          <div className="md:w-80 aspect-[3/4] bg-stone-200 animate-pulse" />
          <div className="p-6 md:p-8 flex-1 space-y-3">
            <div className="w-3/4 h-8 bg-stone-200 rounded animate-pulse" />
            <div className="w-1/2 h-4 bg-stone-200 rounded animate-pulse" />
            <div className="w-1/3 h-4 bg-stone-200 rounded animate-pulse" />
            <div className="w-24 h-6 bg-stone-200 rounded-full animate-pulse mt-4" />
          </div>
        </div>
      </div>
    </div>
  );
}
