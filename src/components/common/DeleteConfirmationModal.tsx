"use client";
import { useState } from "react";
import { X, AlertTriangle } from "lucide-react";

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (confirmInput?: string) => void;
  title?: string;
  itemName?: string;
  description?: string;
  isLoading?: boolean;
  requireConfirmInput?: boolean;
  confirmInputLabel?: string;
  confirmInputPlaceholder?: string;
  expectedInputValue?: string;
}

export default function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Delete Item",
  itemName,
  description,
  isLoading,
  requireConfirmInput = false,
  confirmInputLabel = "Please enter your password or type DELETE to confirm:",
  confirmInputPlaceholder = "Type DELETE to confirm",
  expectedInputValue,
}: DeleteConfirmationModalProps) {
  const [inputValue, setInputValue] = useState("");

  if (!isOpen) return null;

  const isConfirmDisabled =
    isLoading ||
    (requireConfirmInput &&
      (expectedInputValue
        ? inputValue.trim().toLowerCase() !== expectedInputValue.trim().toLowerCase()
        : !inputValue.trim()));

  const handleConfirm = () => {
    onConfirm(inputValue);
    setInputValue("");
  };

  const handleClose = () => {
    setInputValue("");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2 text-rose-600 font-semibold text-base">
            <AlertTriangle className="w-5 h-5 text-rose-600" />
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
              Are you sure you want to delete{" "}
              {itemName && <span className="font-semibold text-gray-900">"{itemName}"</span>}? This action is permanent and cannot be undone.
            </>
          )}
        </p>

        {requireConfirmInput && (
          <div className="mb-6 space-y-2">
            <label className="text-xs font-semibold text-gray-700 block">
              {confirmInputLabel}
            </label>
            <input
              type="password"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={confirmInputPlaceholder}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
            />
          </div>
        )}

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
            disabled={isConfirmDisabled}
            className="flex-1 bg-rose-600 hover:bg-rose-700 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
