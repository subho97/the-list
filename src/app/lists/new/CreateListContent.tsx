'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Plus, Search, Loader2, AlertCircle, Check, ArrowLeft, X } from 'lucide-react';
import { Item } from '@/lib/types';

export default function CreateListContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preSelectId = searchParams.get('add');

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [createdBy, setCreatedBy] = useState('');
  const [editPin, setEditPin] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [step, setStep] = useState<'create' | 'add-items'>('create');
  const [listId, setListId] = useState<string | null>(null);
  const [listSlug, setListSlug] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<Item[]>([]);
  const [allItems, setAllItems] = useState<Item[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Load all items
  useEffect(() => {
    async function loadItems() {
      try {
        const res = await fetch('/api/items?limit=100');
        if (!res.ok) throw new Error('Failed to load');
        const data = await res.json();
        setAllItems(data.items || []);

        // Pre-select item if specified
        if (preSelectId) {
          const preSelected = (data.items || []).find((i: Item) => i.id === preSelectId);
          if (preSelected) {
            setSelectedItems([preSelected]);
          }
        }
      } catch {
        setError('Failed to load items');
      } finally {
        setIsLoading(false);
      }
    }
    loadItems();
  }, [preSelectId]);

  const handleCreate = async () => {
    if (!name.trim()) return;
    setIsCreating(true);
    setError('');

    try {
      const res = await fetch('/api/lists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
          created_by: createdBy.trim() || 'Anonymous',
          edit_pin: editPin.trim() || null,
          is_private: isPrivate,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to create list');
      }

      const list = await res.json();
      setListId(list.id);
      setListSlug(list.slug);

      // If there are pre-selected items, add them now
      if (selectedItems.length > 0) {
        await addItemsToList(list.slug, editPin.trim() || undefined);
      } else {
        setStep('add-items');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsCreating(false);
    }
  };

  const addItemsToList = async (slug: string, pin?: string) => {
    setIsAdding(true);
    try {
      const body: Record<string, unknown> = {};
      for (const item of selectedItems) {
        body.item_id = item.id;
        if (pin) body.pin = pin;
        await fetch(`/api/lists/${slug}/items`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
      }
      setSuccess(true);
      setTimeout(() => {
        router.push(`/lists/${slug}`);
        router.refresh();
      }, 1500);
    } catch {
      setError('Failed to add some items');
    } finally {
      setIsAdding(false);
    }
  };

  const toggleItem = (item: Item) => {
    setSelectedItems(prev =>
      prev.find(i => i.id === item.id)
        ? prev.filter(i => i.id !== item.id)
        : [...prev, item]
    );
  };

  const filteredItems = allItems.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
    (typeFilter === 'all' || item.type === typeFilter) &&
    !selectedItems.find(i => i.id === item.id)
  );

  // Success state after creation
  if (success) {
    return (
      <div className="min-h-screen pt-24 px-4 flex items-center justify-center">
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 mx-auto rounded-full bg-emerald-100 flex items-center justify-center mb-6">
            <Check size={36} className="text-emerald-600" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-stone-900 mb-2">List created!</h2>
          <p className="text-olive text-sm">Redirecting to your list...</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 px-4 flex items-center justify-center">
        <Loader2 size={28} className="animate-spin text-amber-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 md:pt-28 pb-12 px-4 max-w-lg mx-auto">
      <h1 className="font-serif text-3xl md:text-4xl font-bold text-stone-900 mb-2">
        {step === 'create' ? 'New List' : 'Add Items'}
      </h1>
      <p className="text-olive text-sm mb-8">
        {step === 'create' ? 'Curate your collection.' : 'Search and add items to your list.'}
      </p>

      {error && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm mb-6">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Step 1: Create List */}
      {step === 'create' && (
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">List Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Subho's Must Watch 2026"
              className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl text-sm text-stone-700 placeholder:text-olive-light focus:outline-none focus:ring-2 focus:ring-amber-primary/30 focus:border-amber-primary transition-all duration-150"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">Description (optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this list about?"
              rows={3}
              className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl text-sm text-stone-700 placeholder:text-olive-light focus:outline-none focus:ring-2 focus:ring-amber-primary/30 focus:border-amber-primary transition-all duration-150 resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">Your name</label>
            <input
              type="text"
              value={createdBy}
              onChange={(e) => setCreatedBy(e.target.value)}
              placeholder="Anonymous"
              maxLength={50}
              className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl text-sm text-stone-700 placeholder:text-olive-light focus:outline-none focus:ring-2 focus:ring-amber-primary/30 focus:border-amber-primary transition-all duration-150"
            />
          </div>

          {/* PIN Protection */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">
              Edit PIN <span className="text-olive-light font-normal">(optional)</span>
            </label>
            <div className="relative">
              <input
                type={showPin ? 'text' : 'password'}
                value={editPin}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^a-zA-Z0-9]/g, '').slice(0, 6);
                  setEditPin(val);
                }}
                placeholder="6-character PIN"
                maxLength={6}
                inputMode="text"
                className="w-full px-4 py-3 pr-12 bg-white border border-stone-200 rounded-xl text-sm text-stone-700 placeholder:text-olive-light focus:outline-none focus:ring-2 focus:ring-amber-primary/30 focus:border-amber-primary transition-all duration-150"
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-olive-light hover:text-olive text-xs font-medium"
              >
                {showPin ? 'Hide' : 'Show'}
              </button>
            </div>
            <p className="mt-1.5 text-xs text-olive-light">
              {editPin ? (
                <div>
                  <p className="text-xs text-emerald-600 font-medium">✓ PIN protection enabled</p>
                  <p className="text-xs text-olive-light mt-0.5">Edit and delete require this PIN. Cannot be added later. Viewing is always open.</p>
                </div>
              ) : (
                <span className="text-xs text-olive-light">Leave blank for open viewing. PIN is required for edit/delete and cannot be added later.</span>
              )}

            {/* Privacy toggle */}
            <div className="flex items-center justify-between p-3 bg-white border border-stone-200 rounded-xl">
              <div>
                <p className="text-sm font-medium text-stone-700">🔒 Private list</p>
                <p className="text-xs text-olive-light mt-0.5">Only visible to people with the link. Won't show up on public Lists page.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsPrivate(!isPrivate)}
                className={`relative w-12 h-7 rounded-full transition-colors duration-200 ${isPrivate ? 'bg-amber-primary' : 'bg-stone-300'}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow transition-transform duration-200 ${isPrivate ? 'translate-x-5' : ''}`} />
              </button>
            </div>
            </p>
          </div>

          {/* Selected items preview */}
          {selectedItems.length > 0 && (
            <div>
              <p className="text-sm font-medium text-stone-700 mb-2">
                Items to add ({selectedItems.length})
              </p>
              <div className="flex flex-wrap gap-2">
                {selectedItems.map(item => (
                  <span
                    key={item.id}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-primary/10 text-amber-primary rounded-full text-xs font-medium"
                  >
                    {item.title}
                    <button onClick={() => toggleItem(item)} className="ml-1 hover:text-amber-dark">
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={handleCreate}
            disabled={isCreating || !name.trim()}
            className="w-full py-3 bg-amber-primary text-white rounded-xl font-medium text-sm hover:bg-amber-dark transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
          >
            {isCreating ? (
              <><Loader2 size={16} className="animate-spin" /> Creating...</>
            ) : 'Create List'}
          </button>
        </div>
      )}

      {/* Step 2: Add Items */}
      {step === 'add-items' && (
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-olive-light pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search items to add..."
              className="w-full pl-10 pr-4 py-3 bg-white border border-stone-200 rounded-xl text-sm text-stone-700 placeholder:text-olive-light focus:outline-none focus:ring-2 focus:ring-amber-primary/30 focus:border-amber-primary transition-all duration-150"
              autoFocus
            />
          </div>

          {/* Type filter tabs */}
          <div className="flex gap-1 bg-white rounded-xl p-1 shadow-sm border border-stone-200">
            {[{ key: 'all', label: 'All' }, { key: 'movie', label: 'Movies' }, { key: 'book', label: 'Books' }, { key: 'food', label: 'Food' }].map(tab => (
              <button
                key={tab.key}
                onClick={() => setTypeFilter(tab.key)}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all duration-150 ${
                  typeFilter === tab.key
                    ? 'bg-amber-primary text-white shadow-sm'
                    : 'text-olive hover:text-stone-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Selected items */}
          {selectedItems.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedItems.map(item => (
                <span
                  key={item.id}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-primary/10 text-amber-primary rounded-full text-xs font-medium"
                >
                  {item.title}
                  <button onClick={() => toggleItem(item)} className="hover:text-amber-dark">
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Items list */}
          <div className="space-y-2 max-h-[50vh] overflow-y-auto">
            {filteredItems.map(item => (
              <button
                key={item.id}
                onClick={() => toggleItem(item)}
                className="w-full flex items-center gap-3 p-3 rounded-xl border border-stone-100 hover:border-amber-primary/30 hover:bg-stone-50 transition-all duration-150 text-left"
              >
                {item.image_url ? (
                  <img src={item.image_url} alt={item.title} className="w-10 h-14 object-cover rounded-lg shrink-0 bg-stone-100" loading="lazy" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                ) : (
                  <div className="w-10 h-14 rounded-lg bg-stone-100 flex items-center justify-center text-olive-light text-[10px] shrink-0 uppercase tracking-wider">
                    {item.type}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-stone-900 text-sm truncate">{item.title}</p>
                  <p className="text-xs text-olive truncate">{item.creator || item.type}</p>
                </div>
                <Plus size={16} className="text-olive-light shrink-0" />
              </button>
            ))}
            {searchQuery && filteredItems.length === 0 && (
              <p className="text-center text-sm text-olive-light py-8">No items found.</p>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setStep('create')}
              className="flex-1 py-3 border border-stone-200 text-stone-600 rounded-xl font-medium text-sm hover:bg-stone-50 transition-colors duration-150"
            >
              Back
            </button>
            <button
              onClick={() => listSlug && addItemsToList(listSlug, editPin.trim() || undefined)}
              disabled={isAdding || selectedItems.length === 0}
              className="flex-1 py-3 bg-amber-primary text-white rounded-xl font-medium text-sm hover:bg-amber-dark transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
            >
              {isAdding ? (
                <><Loader2 size={16} className="animate-spin" /> Saving...</>
              ) : `Add ${selectedItems.length} item${selectedItems.length !== 1 ? 's' : ''}`}
            </button>
          </div>

          {/* Skip for now */}
          <div className="text-center">
            <button
              onClick={() => listSlug && router.push(`/lists/${listSlug}`)}
              className="text-sm text-olive hover:text-stone-700 transition-colors duration-150"
            >
              Skip — I'll add items later →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
