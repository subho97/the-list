'use client';

import { Search, X } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
}

export default function SearchBar({
  value,
  onChange,
  placeholder = 'Search...',
  debounceMs = 300,
}: SearchBarProps) {
  const [localValue, setLocalValue] = useState(value);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (newValue: string) => {
    setLocalValue(newValue);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      onChange(newValue);
    }, debounceMs);
  };

  return (
    <div className="relative">
      <Search
        size={18}
        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-olive-light"
      />
      <input
        type="text"
        value={localValue}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-10 py-2.5 bg-white border border-stone-200 rounded-xl text-sm text-stone-800 placeholder:text-olive-light focus:outline-none focus:ring-2 focus:ring-amber-primary/30 focus:border-amber-primary transition-all"
      />
      {localValue && (
        <button
          onClick={() => handleChange('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-olive-light hover:text-stone-600"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
