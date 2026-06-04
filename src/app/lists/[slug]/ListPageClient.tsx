'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Item, ItemType } from '@/lib/types';
import {
  Calendar, User, Clock, Trash2, X,
  AlertCircle, Loader2, Plus, Check, Search, Circle, PenBox
} from 'lucide-react';
import Card from '@/components/Card';
import EmptyState from '@/components/EmptyState';
import ListActions from './ListActions';

interface ListData {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  created_at: string;
  created_by: string;
  has_pin: boolean;
  items: (Item & { list_item_id: string; added_at: string; note: string | null; checked: boolean; checked_at: string | null })[];
}

interface ListPageClientProps {
  list: ListData;
}

export default function ListPageClient({ list: initialList }: ListPageClientProps) {
  // PIN modal state
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  // Edit mode state
  const [editPin, setEditPin] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Items state
  const [items, setItems] = useState(initialList.items);
  const [removingItemId, setRemovingItemId] = useState<string | null>(null);

  // Add items modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [allItems, setAllItems] = useState<Item[]>([]);
  const [isLoadingItems, setIsLoadingItems] = useState(false);
  const [addingItemId, setAddingItemId] = useState<string | null>(null);
  const [addSuccess, setAddSuccess] = useState<string | null>(null);

  // Checkmark state
  const [checkedIds, setCheckedIds] = useState<Set<string>>(
    new Set(items.filter(i => i.checked).map(i => i.list_item_id))
  );
  const [togglingItemId, setTogglingItemId] = useState<string | null>(null);
  const [pendingToggleId, setPendingToggleId] = useState<string | null>(null);

  // Filter state
  const [activeFilter, setActiveFilter] = useState<ItemType | 'all'>('all');

  // Load all items when add modal opens
  useEffect(() => {
    if (showAddModal && allItems.length === 0) {
      setIsLoadingItems(true);
      fetch('/api/items?limit=100')
        .then(res => res.json())
        .then(data => setAllItems(data.items || []))
        .catch(() => {})
        .finally(() => setIsLoadingItems(false));
    }
  }, [showAddModal, allItems.length]);

  const handleOpenPinModal = () => {
    // No PIN? Enter edit mode directly
    if (!initialList.has_pin) {
      setIsEditing(true);
      return;
    }
    setPinInput('');
    setPinError('');
    setShowPinModal(true);
  };

  const handleClosePinModal = () => {
    setShowPinModal(false);
    setPendingToggleId(null);
  };

  const handleVerifyPin = async () => {
    if (!/^[a-zA-Z0-9]{4,6}$/.test(pinInput)) {
      setPinError('PIN must be 4-6 alphanumeric characters');
      return;
    }

    setIsVerifying(true);
    setPinError('');

    try {
      const res = await fetch(`/api/lists/${initialList.slug}/verify-pin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: pinInput }),
      });

      const data = await res.json();

      if (data.verified) {
        setEditPin(pinInput);
        setIsEditing(true);
        setShowPinModal(false);
        // Fire any pending toggle
        if (pendingToggleId) {
          const toggleId = pendingToggleId;
          setPendingToggleId(null);
          handleToggleCheck(toggleId, pinInput);
        }
      } else {
        setPinError('Incorrect PIN');
      }
    } catch {
      setPinError('Something went wrong. Try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleRemoveItem = async (listItemId: string) => {
    if (!editPin) return;

    setRemovingItemId(listItemId);

    try {
      const res = await fetch(`/api/lists/${initialList.slug}/items/${listItemId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: editPin }),
      });

      if (res.ok) {
        setItems(prev => prev.filter(item => item.list_item_id !== listItemId));
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to remove item');
      }
    } catch {
      alert('Failed to remove item');
    } finally {
      setRemovingItemId(null);
    }
  };

  const handleDeleteList = async () => {
    const confirmed = window.confirm(`Are you sure you want to delete "${initialList.name}"? This cannot be undone.`);
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/lists/${initialList.slug}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: editPin }),
      });

      if (res.ok) {
        window.location.href = '/lists';
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete list');
      }
    } catch {
      alert('Failed to delete list');
    }
  };

  const handleAddItem = async (itemId: string) => {
    if (!editPin) return;

    setAddingItemId(itemId);

    try {
      const res = await fetch(`/api/lists/${initialList.slug}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item_id: itemId, pin: editPin }),
      });

      if (res.ok) {
        const data = await res.json();
        // Refetch the item details and add to local state
        const item = allItems.find(i => i.id === itemId);
        if (item) {
          setItems(prev => [...prev, {
            ...item,
            list_item_id: data.id,
            added_at: new Date().toISOString(),
            note: null,
            checked: false,
            checked_at: null,
          }]);
        }
        setAddSuccess(itemId);
        setTimeout(() => setAddSuccess(null), 2000);
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to add item');
      }
    } catch {
      alert('Failed to add item');
    } finally {
      setAddingItemId(null);
    }
  };

  const handleToggleCheck = async (listItemId: string, pinOverride?: string) => {
    const effectivePin = pinOverride !== undefined ? pinOverride : editPin;

    if (!effectivePin) {
      if (initialList.has_pin) {
        setPendingToggleId(listItemId);
        handleOpenPinModal();
        return;
      }
      // No PIN — enter edit mode directly
      setIsEditing(true);
      // Toggle without PIN for unsecured lists
      await doToggleCheck(listItemId, '');
      return;
    }

    await doToggleCheck(listItemId, effectivePin);
  };

  const doToggleCheck = async (listItemId: string, pinForToggle: string) => {
    setTogglingItemId(listItemId);

    try {
      const res = await fetch(`/api/lists/${initialList.slug}/items/${listItemId}/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: pinForToggle }),
      });

      if (res.ok) {
        const data = await res.json();
        setCheckedIds(prev => {
          const next = new Set(prev);
          if (data.checked) {
            next.add(listItemId);
          } else {
            next.delete(listItemId);
          }
          return next;
        });
      }
    } catch {
      // silently fail — not critical
    } finally {
      setTogglingItemId(null);
    }
  };

  const handleStopEditing = () => {
    setIsEditing(false);
    setEditPin(null);
  };

  // Filter items not already in the list
  const existingItemIds = new Set(items.map(i => i.id));
  const filteredItems = allItems.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
    !existingItemIds.has(item.id)
  );

  // Compute list with current items for display
  const list = { ...initialList, items };

  // Category filters
  const itemTypes = ['all', ...new Set(items.map(i => i.type))] as (ItemType | 'all')[];
  const typeLabels: Record<string, string> = { all: 'All', movie: 'Movies', book: 'Books', food: 'Food' };
  const filteredListItems = activeFilter === 'all'
    ? items
    : items.filter(i => i.type === activeFilter);

  return (
    <div className="min-h-screen pt-24 md:pt-28 pb-12 px-4 max-w-5xl mx-auto">
      {/* Back link */}
      <Link
        href="/lists"
        className="inline-flex items-center gap-1 text-sm text-olive hover:text-stone-700 mb-5 transition-colors duration-150"
      >
        ← All Lists
      </Link>

      {/* Header */}
      <div className="mb-8">
        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6 md:p-8">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
            <div className="flex-1 min-w-0 w-full">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-serif text-3xl md:text-4xl font-bold text-stone-900 tracking-tight">
                  {list.name}
                </h1>
                {list.has_pin && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-primary/10 text-amber-primary rounded-full text-[11px] font-medium">
                    PIN
                  </span>
                )}
              </div>
              {list.description && (
                <p className="mt-2 text-olive leading-relaxed">{list.description}</p>
              )}
              <div className="flex flex-wrap items-center gap-4 mt-4 text-xs text-olive-light">
                <span className="flex items-center gap-1.5">
                  <User size={12} />
                  {list.created_by}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar size={12} />
                  {new Date(list.created_at).toLocaleDateString('en-US', {
                    year: 'numeric', month: 'short', day: 'numeric'
                  })}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock size={12} />
                  {items.length} item{items.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto flex-wrap">
              {!isEditing ? (
                <button
                  onClick={handleOpenPinModal}
                  className="flex items-center justify-center gap-2 flex-1 sm:flex-none px-4 py-2.5 bg-amber-primary/10 hover:bg-amber-primary/20 text-amber-primary rounded-xl text-sm font-medium transition-all"
                >
                  <PenBox size={14} />
                  Edit this list
                </button>
              ) : (
                <>
                  <span className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-medium">
                    <PenBox size={13} />
                    Editing
                  </span>
                  <button
                    onClick={handleStopEditing}
                    className="flex items-center gap-2 px-3 py-2.5 text-olive hover:text-stone-700 rounded-xl text-sm transition-colors"
                    title="Stop editing"
                  >
                    <X size={16} />
                  </button>
                </>
              )}
              <ListActions slug={list.slug} />
            </div>
          </div>

          {/* Edit mode banner */}
          {isEditing && (
            <div className="mt-4 pt-4 border-t border-stone-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setShowAddModal(true);
                    setSearchQuery('');
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-primary text-white rounded-xl text-sm font-medium hover:bg-amber-dark transition-colors shadow-sm"
                >
                  <Plus size={15} />
                  Add items
                </button>
              </div>
              <div className="flex items-center gap-3">
                {initialList.has_pin ? (
                  <button
                    onClick={handleDeleteList}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
                  >
                    <Trash2 size={13} />
                    Delete list
                  </button>
                ) : (
                  <span className="text-xs text-olive-light italic" title="Only PIN-protected lists can be deleted. This keeps public lists safe from accidental removal.">
                    💡 Add a PIN to enable deletion
                  </span>
                )}
                <span className="text-xs text-olive-light">
                  Hover over an item and click <Trash2 size={11} className="inline text-red-400" /> to remove
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Category filters */}
      {itemTypes.length > 2 && (
        <div className="mb-6 flex flex-wrap gap-2">
          {itemTypes.map(type => (
            <button
              key={type}
              onClick={() => setActiveFilter(type)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-150 ${
                activeFilter === type
                  ? 'bg-amber-primary text-white shadow-sm'
                  : 'bg-white border border-stone-200 text-olive hover:border-amber-primary/40 hover:text-amber-primary'
              }`}
            >
              {typeLabels[type] || type}
              {type !== 'all' && (
                <span className="ml-1.5 text-xs opacity-60">
                  {items.filter(i => i.type === type).length}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Items */}
      {filteredListItems.length === 0 ? (
        <EmptyState type="lists" description={items.length === 0 ? (isEditing ? 'Start adding items to this list!' : 'This list is empty.') : `No ${activeFilter} items in this list.`} />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredListItems.map((item) => {
            const isChecked = checkedIds.has(item.list_item_id);
            return (
              <div key={item.list_item_id} className="relative group">
                <div className={`transition-all duration-200 ${isChecked ? 'opacity-40 saturate-0' : ''}`}>
                  <Card item={item} />
                </div>
                {item.note && (
                  <p className={`mt-1.5 px-1 text-xs italic truncate transition-all duration-200 ${isChecked ? 'text-stone-300' : 'text-olive'}`}>
                    &ldquo;{item.note}&rdquo;
                  </p>
                )}

                {/* Checkmark button */}
                <button
                  onClick={() => handleToggleCheck(item.list_item_id)}
                  className={`absolute top-2 right-2 z-20 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-150 shadow-sm border-2 ${
                    isChecked
                      ? 'bg-emerald-500 border-emerald-500 text-white'
                      : 'bg-white/90 border-stone-300 text-olive-light hover:border-emerald-400 hover:text-emerald-500 opacity-0 group-hover:opacity-100'
                  }`}
                  title={isChecked ? 'Mark as not done' : 'Mark as done'}
                  disabled={togglingItemId === item.list_item_id}
                >
                  {togglingItemId === item.list_item_id ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : isChecked ? (
                    <Check size={16} strokeWidth={3} />
                  ) : (
                    <Circle size={16} />
                  )}
                </button>

                {/* Remove button in edit mode */}
                {isEditing && (
                  <button
                    onClick={() => handleRemoveItem(item.list_item_id)}
                    disabled={removingItemId === item.list_item_id}
                    className="absolute -top-2 -right-2 w-7 h-7 bg-white border border-red-200 rounded-full flex items-center justify-center shadow-sm hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                    title="Remove from list"
                  >
                    {removingItemId === item.list_item_id ? (
                      <Loader2 size={12} className="animate-spin text-red-500" />
                    ) : (
                      <Trash2 size={12} className="text-red-400" />
                    )}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add more CTA (when not editing) */}
      {!isEditing && (
        <div className="mt-10 text-center">
          <Link
            href={`/lists/new`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-amber-primary text-white rounded-xl font-medium text-sm hover:bg-amber-dark transition-colors duration-150 shadow-sm"
          >
            Create your own list
          </Link>
        </div>
      )}

      {/* PIN Modal */}
      {showPinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-lg border border-stone-200 p-6 w-full max-w-sm mx-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif text-lg font-bold text-stone-900">Enter Edit PIN</h3>
              <button
                onClick={handleClosePinModal}
                className="text-olive-light hover:text-stone-700 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-sm text-olive mb-4">
              {pendingToggleId ? 'Enter the PIN to mark this item as done.' : 'This list is PIN-protected. Enter the 4-6 character PIN to edit it.'}
            </p>

            {pinError && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm mb-4">
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                <p>{pinError}</p>
              </div>
            )}

            <div className="relative mb-4">
              <input
                type="password"
                value={pinInput}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^a-zA-Z0-9]/g, '').slice(0, 6);
                  setPinInput(val);
                  setPinError('');
                }}
                placeholder="Enter PIN (4-6 chars)"
                maxLength={6}
                inputMode="text"
                pattern="[a-zA-Z0-9]{4,6}"
                className="w-full text-center text-2xl tracking-[0.5em] px-4 py-4 bg-white border border-stone-200 rounded-xl text-stone-900 placeholder:text-olive-light/50 focus:outline-none focus:ring-2 focus:ring-amber-primary/30 focus:border-amber-primary transition-all duration-150"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleVerifyPin();
                }}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleClosePinModal}
                className="flex-1 py-3 border border-stone-200 text-stone-600 rounded-xl font-medium text-sm hover:bg-stone-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleVerifyPin}
                disabled={pinInput.length < 4 || isVerifying}
                className="flex-1 py-3 bg-amber-primary text-white rounded-xl font-medium text-sm hover:bg-amber-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
              >
                {isVerifying ? (
                  <><Loader2 size={16} className="animate-spin" /> Verifying...</>
                ) : 'Unlock'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Items Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-lg border border-stone-200 p-6 w-full max-w-lg mx-auto max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between mb-4 shrink-0">
              <h3 className="font-serif text-lg font-bold text-stone-900">Add Items</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-olive-light hover:text-stone-700 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Search */}
            <div className="relative mb-4 shrink-0">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-olive-light pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search items..."
                className="w-full pl-10 pr-4 py-3 bg-white border border-stone-200 rounded-xl text-sm text-stone-700 placeholder:text-olive-light focus:outline-none focus:ring-2 focus:ring-amber-primary/30 focus:border-amber-primary transition-all duration-150"
                autoFocus
              />
            </div>

            {/* Items list */}
            <div className="space-y-2 overflow-y-auto flex-1 min-h-0">
              {isLoadingItems ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 size={24} className="animate-spin text-amber-primary" />
                </div>
              ) : filteredItems.length === 0 ? (
                <p className="text-center text-sm text-olive-light py-8">
                  {searchQuery ? 'No items found.' : 'All items already in this list!'}
                </p>
              ) : (
                filteredItems.map(item => (
                  <button
                    key={item.id}
                    onClick={() => handleAddItem(item.id)}
                    disabled={addingItemId === item.id}
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
                    {addSuccess === item.id ? (
                      <Check size={16} className="text-emerald-500 shrink-0" />
                    ) : addingItemId === item.id ? (
                      <Loader2 size={16} className="animate-spin text-amber-primary shrink-0" />
                    ) : (
                      <Plus size={16} className="text-olive-light shrink-0" />
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
