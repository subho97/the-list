'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Star, Loader2, AlertCircle, Check, ArrowLeft } from 'lucide-react';
import PhotoUpload from '@/components/PhotoUpload';

export default function ReviewPage() {
  const router = useRouter();
  const params = useParams();
  const itemId = params.id as string;

  const [itemName, setItemName] = useState('');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [reviewedBy, setReviewedBy] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadItem() {
      try {
        const res = await fetch(`/api/items/${itemId}`);
        if (!res.ok) throw new Error('Not found');
        const data = await res.json();
        setItemName(data.title);
      } catch {
        setError('Item not found');
      } finally {
        setLoading(false);
      }
    }
    loadItem();
  }, [itemId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }
    if (!photo) {
      setError('A photo is required for reviews');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('item_id', itemId);
      formData.append('rating', rating.toString());
      if (comment) formData.append('comment', comment);
      formData.append('reviewed_by', reviewedBy || 'Anonymous');
      formData.append('photo', photo);

      const res = await fetch('/api/reviews', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to submit review');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push(`/items/${itemId}`);
        router.refresh();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 px-4 flex items-center justify-center">
        <Loader2 size={28} className="animate-spin text-amber-primary" />
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen pt-24 px-4 flex items-center justify-center">
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 mx-auto rounded-full bg-emerald-100 flex items-center justify-center mb-6">
            <Check size={36} className="text-emerald-600" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-stone-900 mb-2">Review submitted!</h2>
          <p className="text-olive text-sm">Thanks for sharing your experience.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 md:pt-28 pb-12 px-4 max-w-lg mx-auto">
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-1 text-sm text-olive hover:text-stone-700 mb-5 transition-colors duration-150"
      >
        <ArrowLeft size={16} /> Back
      </button>

      <h1 className="font-serif text-2xl font-bold text-stone-900 mb-1">Review</h1>
      <p className="text-olive text-sm mb-8">{itemName}</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Rating */}
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-2">Rating *</label>
          <div className="flex gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setRating(i + 1)}
                onMouseEnter={() => setHoverRating(i + 1)}
                onMouseLeave={() => setHoverRating(0)}
                className="p-1 transition-transform hover:scale-110 duration-150"
              >
                <Star
                  size={32}
                  className={`transition-colors duration-150 ${
                    (hoverRating || rating) > i
                      ? 'text-amber-primary fill-amber-primary'
                      : 'text-stone-200'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Comment */}
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">Comment</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="How was it?"
            rows={3}
            className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl text-sm text-stone-700 placeholder:text-olive-light focus:outline-none focus:ring-2 focus:ring-amber-primary/30 focus:border-amber-primary transition-all duration-150 resize-none"
          />
        </div>

        {/* Photo (required) */}
        <PhotoUpload onFileSelect={setPhoto} />
        <p className="text-xs text-olive-light -mt-3">A photo is required to verify your visit.</p>

        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">Your name</label>
          <input
            type="text"
            value={reviewedBy}
            onChange={(e) => setReviewedBy(e.target.value)}
            placeholder="Anonymous"
            maxLength={50}
            className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl text-sm text-stone-700 placeholder:text-olive-light focus:outline-none focus:ring-2 focus:ring-amber-primary/30 focus:border-amber-primary transition-all duration-150"
          />
        </div>

        {error && (
          <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting || rating === 0 || !photo}
          className="w-full py-3 bg-amber-primary text-white rounded-xl font-medium text-sm hover:bg-amber-dark transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
        >
          {isSubmitting ? (
            <><Loader2 size={16} className="animate-spin" /> Submitting...</>
          ) : 'Submit review'}
        </button>
      </form>
    </div>
  );
}
