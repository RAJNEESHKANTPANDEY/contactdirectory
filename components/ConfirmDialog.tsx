'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Loader2 } from 'lucide-react';

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  loading,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="fixed inset-0 bg-ink-900/50 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.15 }}
            className="relative w-full max-w-sm bg-paper rounded-2xl shadow-panel p-6"
          >
            <div className="h-10 w-10 rounded-full bg-seal-red/10 text-seal-red flex items-center justify-center mb-4">
              <AlertTriangle size={18} />
            </div>
            <h3 className="font-display text-lg font-semibold text-ink-900">{title}</h3>
            <p className="text-sm text-ink-500 mt-1.5">{description}</p>
            <div className="flex gap-2 mt-6">
              <button
                onClick={onCancel}
                className="flex-1 py-2 rounded-lg border border-ink-100 text-sm text-ink-600 hover:bg-ink-100/50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-seal-red text-white text-sm font-medium hover:bg-seal-red/90 disabled:opacity-60 transition-colors"
              >
                {loading && <Loader2 size={14} className="animate-spin" />}
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
