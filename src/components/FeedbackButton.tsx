'use client';

import { useState } from 'react';
import { MessageCircle, X, Send, AlertCircle, Check } from 'lucide-react';

const FEEDBACK_TYPES = [
  { value: 'broken-link', label: 'Broken Google Maps link' },
  { value: 'wrong-info', label: 'Wrong information' },
  { value: 'missing', label: 'Item missing or wrong' },
  { value: 'suggestion', label: 'Suggestion' },
  { value: 'other', label: 'Other' },
];

export default function FeedbackButton() {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState('broken-link');
  const [message, setMessage] = useState('');
  const [contact, setContact] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!message.trim()) return;
    setSending(true);
    setError('');
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feedback_type: type,
          message: message.trim(),
          contact: contact.trim(),
          page_url: window.location.href,
        }),
      });
      if (!res.ok) throw new Error('Failed to send');
      setSent(true);
      setTimeout(() => { setOpen(false); setSent(false); setMessage(''); setContact(''); }, 2000);
    } catch {
      setError('Something went wrong. Try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-28 right-4 md:bottom-6 md:right-20 z-30 w-12 h-12 rounded-full bg-amber-primary text-white shadow-lg hover:bg-amber-dark hover:shadow-xl transition-all duration-150 flex items-center justify-center"
        aria-label="Send feedback"
      >
        <MessageCircle size={20} />
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="w-full md:max-w-sm bg-white rounded-t-2xl md:rounded-2xl shadow-xl md:mb-0 overflow-hidden max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
              <h3 className="font-semibold text-stone-900 text-sm">Report an issue</h3>
              <button onClick={() => setOpen(false)} className="text-olive-light hover:text-stone-600 transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4 overflow-y-auto">
              {sent ? (
                <div className="flex flex-col items-center py-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mb-3">
                    <Check size={24} className="text-emerald-600" />
                  </div>
                  <p className="text-sm font-medium text-stone-800">Thanks for the report!</p>
                  <p className="text-xs text-olive-light mt-1">We&apos;ll look into it.</p>
                </div>
              ) : (
                <>
                  <div>
                    <label className="text-xs font-medium text-stone-700 mb-1.5 block">What&apos;s the issue?</label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      className="w-full px-3 py-2.5 bg-white border border-stone-200 rounded-xl text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-primary/30 appearance-none"
                    >
                      {FEEDBACK_TYPES.map(t => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-stone-700 mb-1.5 block">Details</label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Which item? What's wrong with the link? Anything specific..."
                      rows={4}
                      className="w-full px-3 py-2.5 bg-white border border-stone-200 rounded-xl text-sm text-stone-700 placeholder:text-olive-light focus:outline-none focus:ring-2 focus:ring-amber-primary/30 resize-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-stone-700 mb-1.5 block">
                      Your contact <span className="text-olive-light font-normal">(optional — if we need to follow up)</span>
                    </label>
                    <input
                      type="text"
                      value={contact}
                      onChange={(e) => setContact(e.target.value)}
                      placeholder="Email, Instagram, or any handle"
                      className="w-full px-3 py-2.5 bg-white border border-stone-200 rounded-xl text-sm text-stone-700 placeholder:text-olive-light focus:outline-none focus:ring-2 focus:ring-amber-primary/30"
                    />
                  </div>

                  {error && (
                    <div className="flex items-start gap-2 text-red-600 text-xs bg-red-50 p-3 rounded-xl">
                      <AlertCircle size={14} className="mt-0.5 shrink-0" />
                      <p>{error}</p>
                    </div>
                  )}

                  <button
                    onClick={handleSubmit}
                    disabled={sending || !message.trim()}
                    className="w-full py-3 bg-amber-primary text-white rounded-xl font-medium text-sm hover:bg-amber-dark transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
                  >
                    {sending ? 'Sending...' : <><Send size={15} /> Send report</>}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
