'use client';

import { useState } from 'react';
import { ListPlus, Check, Share2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ItemActionsProps {
  itemId: string;
  itemType: string;
}

export default function ItemActions({ itemId, itemType }: ItemActionsProps) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = window.location.href;

    // Try native Web Share API first
    if (navigator.share) {
      try {
        await navigator.share({ title: document.title, url });
        return;
      } catch {
        return;
      }
    }

    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = url;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <div className="flex gap-3 mt-6">
        <button
          onClick={() => router.push(`/lists/new?add=${itemId}`)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-amber-primary/10 text-amber-primary rounded-xl font-medium text-sm hover:bg-amber-primary/20 transition-colors"
        >
          <ListPlus size={16} />
          Add to a list
        </button>
        {itemType === 'food' && (
          <button
            onClick={() => router.push(`/items/${itemId}/review`)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-rust/10 text-rust rounded-xl font-medium text-sm hover:bg-rust/20 transition-colors"
          >
            Add Review
          </button>
        )}
        <button
          onClick={handleShare}
          className="px-4 py-2.5 border border-stone-200 rounded-xl text-olive hover:text-stone-600 hover:bg-stone-50 transition-all"
          title="Copy link"
        >
          {copied ? <Check size={18} className="text-emerald-500" /> : <Share2 size={18} />}
        </button>
      </div>
    </>
  );
}
