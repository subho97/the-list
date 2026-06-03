'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function NotFoundItem() {
  return (
    <div className="min-h-screen pt-24 px-4 flex items-center justify-center">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 mx-auto rounded-full bg-amber-50 flex items-center justify-center mb-4">
          <AlertTriangle size={28} className="text-amber-primary" />
        </div>
        <h2 className="font-serif text-xl font-bold text-stone-900 mb-2">Item not found</h2>
        <p className="text-sm text-olive mb-6">This item may have been removed or never existed.</p>
        <Link
          href="/browse"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-primary text-white rounded-xl text-sm font-medium hover:bg-amber-dark transition-colors duration-150 shadow-sm"
        >
          Browse items
        </Link>
      </div>
    </div>
  );
}
