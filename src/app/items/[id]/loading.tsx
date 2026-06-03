import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-screen pt-24 px-4 flex items-center justify-center">
      <div className="text-center">
        <Loader2 size={28} className="animate-spin text-amber-primary mx-auto" />
        <p className="text-sm text-olive-light mt-3">Loading...</p>
      </div>
    </div>
  );
}
