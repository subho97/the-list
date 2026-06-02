'use client';

import { useState } from 'react';
import { Share2, Check } from 'lucide-react';

interface ListActionsProps {
  slug: string;
}

export default function ListActions({ slug }: ListActionsProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = `${window.location.origin}/lists/${slug}`;
    const title = 'Check out my list on The List';
    const text = 'A curated collection of the best things.';

    // Try native Web Share API first (opens OS share sheet on phones)
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch {
        // User cancelled - do nothing
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
    <button
      onClick={handleShare}
      className="flex items-center gap-2 px-4 py-2.5 bg-stone-100 hover:bg-stone-200 rounded-xl text-sm font-medium text-stone-600 transition-all"
    >
      {copied ? (
        <><Check size={16} className="text-emerald-500" /> Copied!</>
      ) : (
        <><Share2 size={16} /> Share list</>
      )}
    </button>
  );
}
