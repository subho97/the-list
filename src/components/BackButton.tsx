'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface BackButtonProps {
  /** Fallback URL when there's no history */
  fallbackHref: string;
  /** Label text */
  label?: string;
}

export default function BackButton({ fallbackHref, label = 'Back' }: BackButtonProps) {
  const router = useRouter();

  const handleClick = (e: React.MouseEvent) => {
    // If there's browser history, go back
    if (window.history.length > 1) {
      e.preventDefault();
      router.back();
    }
    // Otherwise, follow the Link to fallback
  };

  return (
    <Link
      href={fallbackHref}
      onClick={handleClick}
      className="inline-flex items-center gap-1 text-sm text-olive hover:text-stone-700 mb-5 transition-colors duration-150"
    >
      ← {label}
    </Link>
  );
}
