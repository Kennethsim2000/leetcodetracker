"use client";

import React from "react";
import { CheckCircle, X } from "lucide-react";

interface SuccessToastProps {
  message: string;
  onClose: () => void;
}

export const SuccessToast: React.FC<SuccessToastProps> = ({
  message,
  onClose,
}) => {
  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 duration-300">
      <div className="bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 max-w-sm">
        <CheckCircle className="w-5 h-5 flex-shrink-0" />
        <span className="font-medium">{message}</span>
        <button
          onClick={onClose}
          className="ml-2 hover:bg-green-600 rounded p-1 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
