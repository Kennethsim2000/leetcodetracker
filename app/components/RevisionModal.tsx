import React, { useState } from "react";
import { CheckCircle, Calendar } from "lucide-react";

interface RevisionModalProps {
  questionName: string;
  onConfirm: (weeks: number) => void;
  onClose: () => void;
}

export const RevisionModal: React.FC<RevisionModalProps> = ({
  questionName,
  onConfirm,
  onClose,
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<number>(4); // Default to 1 month (4 weeks)

  const revisionOptions = [
    { weeks: 2, label: "2 weeks", description: "Quick review" },
    { weeks: 4, label: "1 month", description: "Standard interval" },
    { weeks: 8, label: "2 months", description: "Extended review" },
    { weeks: 12, label: "3 months", description: "Long-term retention" },
  ];

  const handleConfirm = () => {
    onConfirm(selectedPeriod);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleConfirm();
    }
    if (e.key === "Escape") {
      onClose();
    }
  };

  const getNextReviewDate = (weeks: number): string => {
    const date = new Date();
    date.setDate(date.getDate() + weeks * 7);
    return date.toLocaleDateString("en-GB"); // DD/MM/YYYY format
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 w-[480px] shadow-2xl border border-gray-200 dark:border-gray-700 backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
            <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Question Solved!
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Set your next revision schedule
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <svg
            className="w-5 h-5 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* Question Name */}
      <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
        <p className="text-lg font-semibold text-gray-900 dark:text-white text-center">
          &quot;{questionName}&quot;
        </p>
      </div>

      {/* Revision Options */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
          When would you like to revise this question again?
        </label>
        <div className="space-y-3">
          {revisionOptions.map(({ weeks, label, description }) => (
            <button
              key={weeks}
              type="button"
              onClick={() => setSelectedPeriod(weeks)}
              onKeyPress={handleKeyPress}
              className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                selectedPeriod === weeks
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md"
                  : "border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-600"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      selectedPeriod === weeks
                        ? "border-blue-500 bg-blue-500"
                        : "border-gray-300 dark:border-gray-600"
                    }`}
                  >
                    {selectedPeriod === weeks && (
                      <div className="w-2 h-2 rounded-full bg-white"></div>
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {label}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <Calendar className="w-4 h-4" />
                  <span>{getNextReviewDate(weeks)}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <button
          onClick={handleConfirm}
          className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-4 rounded-xl hover:from-green-600 hover:to-green-700 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
        >
          <CheckCircle className="w-5 h-5" />
          Mark as Solved
        </button>
        <button
          onClick={onClose}
          className="px-6 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-4 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all font-semibold"
        >
          Cancel
        </button>
      </div>

      {/* Keyboard shortcut hint */}
      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          Press{" "}
          <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">
            Enter
          </kbd>{" "}
          to confirm or{" "}
          <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">
            Esc
          </kbd>{" "}
          to cancel
        </p>
      </div>
    </div>
  );
};
