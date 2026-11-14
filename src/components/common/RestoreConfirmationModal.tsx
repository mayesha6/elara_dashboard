"use client";
import { useState } from "react";
import { X, RotateCcw } from "lucide-react";

interface RestoreConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason?: string) => void;
  title?: string;
  itemName?: string;
  description?: string;
  isLoading?: boolean;
}

export default function RestoreConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Restore Account",
  itemName,
  description,
  isLoading,
}: RestoreConfirmationModalProps) {
  const [reason, setReason] = useState("");

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm(reason.trim() || undefined);
    setReason("");
  };

  const handleClose = () => {
    setReason("");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2 text-emerald-600 font-semibold text-base">
            <RotateCcw className="w-5 h-5 text-emerald-600" />
            <span>{title}</span>
          </div>
          <button 
            type="button" 
            onClick={handleClose} 
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <p className="text-sm text-gray-600 mb-4 leading-relaxed">
          {description ? (
            description
          ) : (
            <>
              Are you sure you want to restore{" "}
              {itemName && <span className="font-semibold text-gray-900">"{itemName}"</span>}? 
              This will reactivate the account and restore access.
            </>
          )}
        </p>

        <div className="mb-5 space-y-1.5">
          <label className="text-xs font-semibold text-gray-700 block">
            Reason for Restoration <span className="text-gray-400 font-normal">(optional, logged in audit trail)</span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Requested reactivation, subscription renewed..."
            rows={2}
            className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none"
          />
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleClose}
            disabled={isLoading}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isLoading}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? "Restoring..." : "Restore Account"}
          </button>
        </div>
      </div>
    </div>
  );
}
