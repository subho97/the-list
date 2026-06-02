'use client';

import { useState, useEffect } from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';

interface VoteButtonsProps {
  itemId: string;
  initialUpvotes?: number;
  initialDownvotes?: number;
  size?: 'sm' | 'md';
}

export default function VoteButtons({ itemId, initialUpvotes = 0, initialDownvotes = 0, size = 'sm' }: VoteButtonsProps) {
  const [upvotes, setUpvotes] = useState(initialUpvotes);
  const [downvotes, setDownvotes] = useState(initialDownvotes);
  const [myVote, setMyVote] = useState<'up' | 'down' | null>(null);
  const [animating, setAnimating] = useState<'up' | 'down' | null>(null);

  // Load existing vote from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('thelist_votes');
      if (stored) {
        const votes = JSON.parse(stored);
        if (votes[itemId]) setMyVote(votes[itemId]);
      }
    } catch {}
  }, [itemId]);

  const handleVote = async (vote: 'up' | 'down') => {
    // If already voted this way, undo
    const newVote = myVote === vote ? null : vote;

    // Optimistic update
    setAnimating(vote);
    setTimeout(() => setAnimating(null), 300);

    if (myVote === 'up') setUpvotes(prev => Math.max(0, prev - 1));
    if (myVote === 'down') setDownvotes(prev => Math.max(0, prev - 1));

    if (newVote === 'up') setUpvotes(prev => prev + 1);
    if (newVote === 'down') setDownvotes(prev => prev + 1);

    setMyVote(newVote);

    // Save to localStorage
    try {
      const stored = JSON.parse(localStorage.getItem('thelist_votes') || '{}');
      if (newVote) {
        stored[itemId] = newVote;
      } else {
        delete stored[itemId];
      }
      localStorage.setItem('thelist_votes', JSON.stringify(stored));
    } catch {}

    // Send to server
    try {
      await fetch(`/api/items/${itemId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vote: newVote }),
      });
    } catch {
      // revert on error? for now, keep optimistic
    }
  };

  const iconSize = size === 'md' ? 18 : 14;

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleVote('up'); }}
        className={`flex items-center gap-0.5 px-2 py-1 rounded-lg text-xs font-medium transition-all duration-150 ${
          myVote === 'up'
            ? 'bg-emerald-100 text-emerald-700'
            : 'text-olive-light hover:text-emerald-600 hover:bg-emerald-50'
        } ${animating === 'up' ? 'scale-110' : ''}`}
      >
        <ThumbsUp size={iconSize} />
        <span>{upvotes}</span>
      </button>
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleVote('down'); }}
        className={`flex items-center gap-0.5 px-2 py-1 rounded-lg text-xs font-medium transition-all duration-150 ${
          myVote === 'down'
            ? 'bg-red-100 text-red-700'
            : 'text-olive-light hover:text-red-600 hover:bg-red-50'
        } ${animating === 'down' ? 'scale-110' : ''}`}
      >
        <ThumbsDown size={iconSize} />
        <span>{downvotes}</span>
      </button>
    </div>
  );
}
