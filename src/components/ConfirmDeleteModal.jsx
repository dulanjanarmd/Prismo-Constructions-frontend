import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Trash2, X } from 'lucide-react';

/**
 * ConfirmDeleteModal - Aligned with Prismo Construction's clean, modern theme.
 *
 * Uses:
 *   - glass-card container styling (rounded-xl / border-border / subtle shadow)
 *   - Prismo brand typography and accent hierarchy
 *   - Consistent button styling with subtle feedback
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

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => cancelRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => {
      if (e.key === 'Escape' && !isLoading) onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, isLoading, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget && !isLoading) onClose();
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="glass-card w-full max-w-md p-6 relative shadow-xl overflow-hidden"
            role="dialog"
            aria-modal="true"
          >
            {/* Close button */}
            {!isLoading && (
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors rounded-lg p-1.5 hover:bg-slate-100"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            )}

            {/* Header with Icon */}
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6 text-amber-500" />
              </div>
              <div className="flex-1 pr-6">
                <h2 className="text-xl font-bold text-slate-900 leading-snug">
                  {title}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">Permanent action confirmation</p>
              </div>
            </div>

            {/* Message Body */}
            <div className="space-y-3 mb-6">
              <p className="text-sm text-slate-600 leading-relaxed">
                {message}
                {itemName && (
                  <> <span className="font-bold text-slate-900">"{itemName}"</span>?</>
                )}
              </p>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-2.5">
                <div className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                <p className="text-xs text-slate-600 font-medium">
                  This action cannot be undone and will permanently remove associated data.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end items-center gap-3 pt-2 border-t border-slate-100">
              <button
                ref={cancelRef}
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={isLoading}
                className="px-4 py-2 text-sm font-bold bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all shadow-md shadow-red-500/20 flex items-center gap-2 disabled:opacity-60"
              >
                {isLoading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
                    </svg>
                    <span>Deleting…</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>{confirmLabel}</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmDeleteModal;
