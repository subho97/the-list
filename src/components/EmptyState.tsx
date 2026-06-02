interface EmptyStateProps {
  type: 'items' | 'lists' | 'reviews' | 'search';
  title?: string;
  description?: string;
}

const configs = {
  items: {
    title: 'Nothing here yet',
    description: 'Be the first to add something to The List!',
    svg: (
      <svg className="w-32 h-32 mx-auto text-olive-light" fill="none" viewBox="0 0 200 200" stroke="currentColor" strokeWidth="1">
        <rect x="40" y="30" width="120" height="140" rx="8" strokeDasharray="6 4" />
        <line x1="60" y1="70" x2="140" y2="70" strokeDasharray="4 3" />
        <line x1="60" y1="95" x2="120" y2="95" strokeDasharray="4 3" />
        <line x1="60" y1="120" x2="130" y2="120" strokeDasharray="4 3" />
      </svg>
    ),
  },
  lists: {
    title: 'No lists yet',
    description: 'Create a list to organize your favorites.',
    svg: (
      <svg className="w-32 h-32 mx-auto text-olive-light" fill="none" viewBox="0 0 200 200" stroke="currentColor" strokeWidth="1">
        <rect x="30" y="30" width="140" height="140" rx="8" strokeDasharray="6 4" />
        <text x="100" y="110" textAnchor="middle" fontSize="40">📋</text>
      </svg>
    ),
  },
  reviews: {
    title: 'No reviews yet',
    description: 'Be the first to review this place.',
    svg: (
      <svg className="w-32 h-32 mx-auto text-olive-light" fill="none" viewBox="0 0 200 200" stroke="currentColor" strokeWidth="1">
        <path d="M60 140 L100 60 L140 140" strokeDasharray="6 4" />
        <circle cx="100" cy="50" r="8" />
        <circle cx="60" cy="130" r="8" />
        <circle cx="140" cy="130" r="8" />
      </svg>
    ),
  },
  search: {
    title: 'No results found',
    description: 'Try a different search term.',
    svg: (
      <svg className="w-32 h-32 mx-auto text-olive-light" fill="none" viewBox="0 0 200 200" stroke="currentColor" strokeWidth="1">
        <circle cx="85" cy="85" r="35" strokeDasharray="6 4" />
        <line x1="110" y1="110" x2="150" y2="150" strokeDasharray="4 3" />
      </svg>
    ),
  },
};

export default function EmptyState({ type, title, description }: EmptyStateProps) {
  const config = configs[type];

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {config.svg}
      <h3 className="mt-6 text-xl font-serif font-bold text-stone-700">
        {title || config.title}
      </h3>
      <p className="mt-2 text-sm text-olive-light max-w-xs leading-relaxed">
        {description || config.description}
      </p>
    </div>
  );
}
