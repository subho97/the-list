import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import BrowseContent from './BrowseContent';

export default function BrowsePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen pt-24 px-4 flex items-center justify-center">
        <Loader2 size={28} className="animate-spin text-amber-primary" />
      </div>
    }>
      <BrowseContent />
    </Suspense>
  );
}
