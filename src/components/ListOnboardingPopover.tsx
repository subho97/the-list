'use client';

import { useState, useRef, useEffect } from 'react';
import { Info, X, Lock, Share2, Layers } from 'lucide-react';

const LS_KEY = 'list-onboarding-seen';

export default function ListOnboardingPopover() {
  const [isOpen, setIsOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return !sessionStorage.getItem(LS_KEY);
    }
    return false;
  });
  const popoverRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const dismiss = () => {
    setIsOpen(false);
    try { sessionStorage.setItem(LS_KEY, '1'); } catch {}
  };

  // Close on click outside and Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node) &&
          buttonRef.current && !buttonRef.current.contains(e.target as Node)) {
        dismiss();
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') dismiss();
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [isOpen]);

  return (
    <div className="relative inline-block">
      <button
        ref={buttonRef}
        onClick={() => {
          const next = !isOpen;
          setIsOpen(next);
          if (!next) {
            try { sessionStorage.setItem(LS_KEY, '1'); } catch {}
          }
        }}
        className="w-6 h-6 rounded-full bg-amber-primary/10 text-amber-primary flex items-center justify-center hover:bg-amber-primary/20 transition-colors duration-150"
        title="How lists work"
        aria-label="How lists work"
      >
        <Info size={14} />
      </button>

      {isOpen && (
        <>
          {/* Overlay backdrop — only on mobile */}
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 sm:hidden" onClick={dismiss} />
          <div
            ref={popoverRef}
            className="fixed sm:absolute top-1/2 sm:top-8 left-1/2 sm:left-0 -translate-x-1/2 sm:translate-x-0 -translate-y-1/2 sm:translate-y-0 z-50 w-72 bg-white rounded-2xl border border-stone-200 shadow-lg p-5 space-y-4"
          >
          <div className="flex items-center justify-between">
            <h3 className="font-serif font-bold text-stone-900 text-base">How lists work</h3>
            <button
              onClick={dismiss}
              className="text-olive-light hover:text-stone-600 transition-colors"
            >
              <X size={14} />
            </button>
          </div>

          <div className="space-y-3 text-sm text-stone-600 leading-relaxed">
            <div className="flex items-start gap-2.5">
              <div className="w-6 h-6 rounded-full bg-amber-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                <Layers size={13} className="text-amber-primary" />
              </div>
              <p><strong className="text-stone-900">Curated collections.</strong> Group your favourite movies, books, and food spots into themed lists — weekend binges, comfort reads, late-night eats. Whatever you want.</p>
            </div>

            <div className="flex items-start gap-2.5">
              <div className="w-6 h-6 rounded-full bg-amber-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                <Share2 size={13} className="text-amber-primary" />
              </div>
              <p><strong className="text-stone-900">Anyone can contribute.</strong> No sign-up needed. Create a list, add items, share the link. Everyone can explore and add to it.</p>
            </div>

            <div className="flex items-start gap-2.5">
              <div className="w-6 h-6 rounded-full bg-amber-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                <Lock size={13} className="text-amber-primary" />
              </div>
              <p><strong className="text-stone-900">PIN = you control edits.</strong> Set a PIN when creating a list. Anyone can view it, but only people with the PIN can edit or delete items. No PIN = anyone can edit.</p>
            </div>
          </div>

          <button
            onClick={dismiss}
            className="w-full py-2.5 bg-amber-primary text-white rounded-xl text-sm font-medium hover:bg-amber-dark transition-colors duration-150 shadow-sm"
          >
            Got it
          </button>
        </div>
        </>
      )}
    </div>
  );
}
