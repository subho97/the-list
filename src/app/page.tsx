import Link from 'next/link';
import { Star, Share2, Lock } from 'lucide-react';
import RecentItems from '@/components/RecentItems';

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-28 pb-20 md:pt-32 md:pb-24 px-4 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-amber-primary/[0.07] via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-amber-primary/[0.03] rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-xl mx-auto">
          <h1 className="font-serif text-6xl md:text-7xl font-bold text-stone-900 tracking-tight leading-[1.1]">
            The List
          </h1>
          <p className="mt-5 text-xl md:text-2xl text-olive font-medium">
            Discover what your people love.
          </p>
          <p className="mt-3 text-sm text-olive-light max-w-md mx-auto leading-relaxed">
            A community-driven lifestyle platform — real people sharing the movies that moved them,
            the books that stayed with them, and the food spots worth the trip.
            No algorithms. No ads. Just word-of-mouth, amplified.
          </p>
          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 rounded-full border border-emerald-200/50">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-[11px] text-emerald-700 font-medium tracking-wide">Community-curated. Zero ads.</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
            <Link
              href="/browse"
              className="px-6 py-3 bg-amber-primary text-white rounded-xl font-medium text-sm hover:bg-amber-dark transition-all duration-150 shadow-sm hover:shadow-md"
            >
              Start exploring
            </Link>
            <Link
              href="/add"
              className="px-6 py-3 bg-white border border-stone-200 text-stone-700 rounded-xl font-medium text-sm hover:border-amber-primary/40 hover:text-amber-primary transition-all duration-150 shadow-sm"
            >
              Add something good
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-4 pb-20 max-w-3xl mx-auto">
        <h2 className="font-serif text-2xl font-bold text-stone-900 text-center mb-10">
          A community lifestyle platform
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-amber-primary/10 flex items-center justify-center mb-4">
              <Star size={22} className="text-amber-primary" />
            </div>
            <h3 className="font-semibold text-stone-900 text-sm mb-2">Real people, real picks</h3>
            <p className="text-xs text-olive-light leading-relaxed">
              Every entry is someone&apos;s genuine recommendation — a movie that wrecked them, a book that changed them, a meal they&apos;re still thinking about. No sponsors, no paid placements.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-amber-primary/10 flex items-center justify-center mb-4">
              <Share2 size={22} className="text-amber-primary" />
            </div>
            <h3 className="font-semibold text-stone-900 text-sm mb-2">Build your lifestyle</h3>
            <p className="text-xs text-olive-light leading-relaxed">
              Create curated lists for every mood — weekend binges, cozy reads, late-night eats. Share them with friends, or keep them as your personal taste archive.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-amber-primary/10 flex items-center justify-center mb-4">
              <Lock size={22} className="text-amber-primary" />
            </div>
            <h3 className="font-semibold text-stone-900 text-sm mb-2">Your taste, your rules</h3>
            <p className="text-xs text-olive-light leading-relaxed">
              Protect your lists with a PIN. Browse by mood, genre, or city. Everything you love, organized how you want it.
            </p>
          </div>
        </div>
      </section>

      {/* Recent Additions — loaded on the client for instant navigation */}
      <RecentItems />

      {/* Footer note */}
      <section className="px-4 pb-28 text-center">
        <p className="text-xs text-olive-light">
          The List — where your taste meets the world&apos;s.<br />Built by the community ♥
        </p>
      </section>
    </div>
  );
}
