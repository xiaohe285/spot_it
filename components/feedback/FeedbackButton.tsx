'use client';

import { useEffect, useState } from 'react';

interface FeedbackButtonProps {
  searchQuery: string;
}

const MAX_LENGTH = 2000;

export default function FeedbackButton({ searchQuery }: FeedbackButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const defaultContent = `I want to play a spot-the-difference game about ${searchQuery}`;

  useEffect(() => {
    if (isOpen) {
      setContent(defaultContent);
      setError(null);
      setSuccess(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, searchQuery]);

  const handleClose = () => {
    if (submitting) return;
    setIsOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = content.trim();
    if (!trimmed) {
      setError('Please enter your feedback.');
      return;
    }
    if (trimmed.length > MAX_LENGTH) {
      setError(`Feedback is too long (max ${MAX_LENGTH} characters).`);
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feedback_type: 'new_game',
          feedback: trimmed,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data?.error || 'Failed to submit feedback. Please try again.');
        setSubmitting(false);
        return;
      }

      setSuccess(true);
      setSubmitting(false);
      setTimeout(() => {
        setIsOpen(false);
      }, 1500);
    } catch (err) {
      console.error('Submit feedback error:', err);
      setError('Network error. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="cursor-pointer inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-bold rounded-full shadow-md hover:shadow-lg transition-all transform hover:scale-105 active:scale-95"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
        Suggest a game
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm p-4"
          onClick={handleClose}
        >
          <div
            className="bg-white dark:bg-gray-900 rounded-2xl max-w-lg w-full p-8 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={handleClose}
              disabled={submitting}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Close"
            >
              <span className="text-xl font-bold">×</span>
            </button>

            <div className="mb-6">
              <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">
                Tell us what you want to play
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Share your ideas or suggestions. We&apos;ll do our best to add new
                games you love.
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
              </div>
            )}
            {success && (
              <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <p className="text-green-600 dark:text-green-400 text-sm">
                  Thanks! Your feedback has been submitted.
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="feedback-content"
                  className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
                >
                  Your suggestion
                </label>
                <textarea
                  id="feedback-content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={5}
                  maxLength={MAX_LENGTH}
                  disabled={submitting || success}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all resize-none disabled:opacity-60"
                  placeholder="Describe the game you'd like to play..."
                />
                <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 text-right">
                  {content.length} / {MAX_LENGTH}
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting || success}
                className="cursor-pointer w-full py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg font-bold hover:from-orange-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-orange-500/30"
              >
                {submitting ? 'Submitting...' : success ? 'Submitted' : 'Submit'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
