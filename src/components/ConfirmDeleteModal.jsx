import { useEffect, useRef } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

/**
 * ConfirmDeleteModal - A reusable, premium-styled delete confirmation dialog.
 *
 * Props:
 *   isOpen       {boolean}  - Whether the modal is visible
 *   onClose      {function} - Called when the user cancels
 *   onConfirm    {function} - Called when the user confirms deletion
 *   title        {string}   - Modal heading (default: "Delete Confirmation")
 *   message      {string}   - Body text explaining what will be deleted
 *   itemName     {string}   - Optional: name/label of the item being deleted (rendered bold)
 *   confirmLabel {string}   - Label for the confirm button (default: "Delete")
 *   isLoading    {boolean}  - Shows a spinner and disables buttons while deleting
 */
const ConfirmDeleteModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Delete Confirmation',
  message = 'Are you sure you want to delete this item? This action cannot be undone.',
  itemName,
  confirmLabel = 'Delete',
  isLoading = false,
}) => {
  const cancelRef = useRef(null);

  // Focus the cancel button when the modal opens (accessibility)
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => cancelRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => {
      if (e.key === 'Escape' && !isLoading) onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget && !isLoading) onClose(); }}
    >
      {/* Modal Panel */}
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
        style={{ animation: 'cdm-pop 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cdm-title"
      >
        {/* Top accent bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-red-500 via-red-400 to-orange-400" />

        {/* Close button */}
        {!isLoading && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors rounded-full p-1 hover:bg-slate-100"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Content */}
        <div className="px-6 pt-6 pb-7">
          {/* Icon */}
          <div className="flex items-center justify-center mb-4">
            <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center border-2 border-red-100">
              <AlertTriangle className="w-7 h-7 text-red-500" strokeWidth={2} />
            </div>
          </div>

          {/* Title */}
          <h2 id="cdm-title" className="text-center text-lg font-bold text-slate-800 mb-2">
            {title}
          </h2>

          {/* Message */}
          <p className="text-center text-sm text-slate-500 leading-relaxed">
            {message}
            {itemName && (
              <> <span className="font-semibold text-slate-700">"{itemName}"</span></>
            )}
          </p>

          {/* Warning note */}
          <div className="mt-4 flex items-start gap-2 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
            <Trash2 className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-red-600 leading-relaxed">
              This action is <span className="font-semibold">permanent</span> and cannot be undone.
            </p>
          </div>

          {/* Actions */}
          <div className="mt-5 flex gap-3">
            <button
              ref={cancelRef}
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-70"
              style={{
                background: isLoading
                  ? '#f87171'
                  : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                boxShadow: isLoading ? 'none' : '0 4px 14px rgba(239,68,68,0.35)',
              }}
            >
              {isLoading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
                  </svg>
                  Deleting…
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  {confirmLabel}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Keyframe animation */}
      <style>{`
        @keyframes cdm-pop {
          0%   { opacity: 0; transform: scale(0.85) translateY(12px); }
          100% { opacity: 1; transform: scale(1)   translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default ConfirmDeleteModal;
