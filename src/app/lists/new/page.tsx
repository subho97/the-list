import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import CreateListContent from './CreateListContent';

export default function CreateListPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen pt-20 px-4 flex items-center justify-center">
        <Loader2 size={28} className="animate-spin text-amber-primary" />
      </div>
    }>
      <CreateListContent />
    </Suspense>
  );
}
