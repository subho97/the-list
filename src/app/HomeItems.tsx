'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Item } from '@/lib/types';
import { Film, BookOpen, UtensilsCrossed } from 'lucide-react';
import Card from '@/components/Card';

interface HomeItemsProps {
  movies: Item[];
  books: Item[];
  food: Item[];
}

type TabType = 'movies' | 'books' | 'food';

const tabs: { key: TabType; label: string; icon: typeof Film; emptyMsg: string }[] = [
  { key: 'movies', label: 'Movies', icon: Film, emptyMsg: 'No movies yet. Be the first!' },
  { key: 'books', label: 'Books', icon: BookOpen, emptyMsg: 'No books yet. Be the first!' },
  { key: 'food', label: 'Food', icon: UtensilsCrossed, emptyMsg: 'No food places yet. Be the first!' },
];

export default function HomeItems({ movies, books, food }: HomeItemsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('movies');

  const itemsMap: Record<TabType, Item[]> = { movies, books, food };

  return (
    <section className="max-w-5xl mx-auto px-4 pb-24 md:pb-16">
      {/* Tabs */}
      <div className="flex gap-1 bg-white rounded-xl p-1 shadow-sm border border-stone-200 mb-6">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-amber-primary text-white shadow-sm'
                  : 'text-olive hover:text-stone-700'
              }`}
            >
              <Icon size={16} />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Items grid */}
      {itemsMap[activeTab].length > 0 ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {itemsMap[activeTab].slice(0, 6).map((item) => (
              <Card key={item.id} item={item} />
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link
              href={`/browse?type=${activeTab === 'food' ? 'food' : activeTab === 'books' ? 'book' : 'movie'}`}
              className="inline-flex text-sm text-amber-primary font-medium hover:text-amber-dark transition-colors duration-150"
            >
              View all {activeTab} →
            </Link>
          </div>
        </>
      ) : (
        <div className="text-center py-20">
          <div className="w-20 h-20 mx-auto flex items-center justify-center rounded-full bg-stone-100 text-olive-light mb-4">
            {activeTab === 'movies' ? <Film size={36} /> : activeTab === 'books' ? <BookOpen size={36} /> : <UtensilsCrossed size={36} />}
          </div>
          <p className="text-olive text-sm">{tabs.find(t => t.key === activeTab)?.emptyMsg}</p>
          <Link
            href="/add"
            className="mt-4 inline-flex items-center gap-1.5 px-5 py-2.5 bg-amber-primary text-white rounded-xl text-sm font-medium hover:bg-amber-dark transition-colors duration-150 shadow-sm"
          >
            Add one now
          </Link>
        </div>
      )}
    </section>
  );
}
