// components/AddQuestionModal.tsx

import React, { useState } from "react";
import { Plus } from "lucide-react";
import { LeetCodeQuestion } from "../types";

interface AddQuestionModalProps {
  onAdd: (
    question: Omit<LeetCodeQuestion, "id" | "last_solved" | "reminder_date">
  ) => void;
  onClose: () => void;
}

export const AddQuestionModal: React.FC<AddQuestionModalProps> = ({
  onAdd,
  onClose,
}) => {
  const [formData, setFormData] = useState({
    question: "",
    url: "",
    difficulty: "Easy" as "Easy" | "Medium" | "Hard",
  });

  const [errors, setErrors] = useState({
    question: "",
    url: "",
  });

  const validateForm = (): boolean => {
    const newErrors = { question: "", url: "" };
    let isValid = true;

    if (!formData.question.trim()) {
      newErrors.question = "Question name is required";
      isValid = false;
    }

    if (!formData.url.trim()) {
      newErrors.url = "URL is required";
      isValid = false;
    } else if (!formData.url.includes("leetcode.com")) {
      newErrors.url = "Please enter a valid LeetCode URL";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onAdd(formData);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
    if (e.key === "Escape") {
      onClose();
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "bg-green-100 text-green-800 border-green-200";
      case "Medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Hard":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 w-[480px] shadow-2xl border border-gray-200 dark:border-gray-700 backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Add New Question
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Track your LeetCode progress
          </p>
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

      <div className="space-y-6">
        {/* Question Name */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Question Name
          </label>
          <input
            type="text"
            value={formData.question}
            onChange={(e) => {
              setFormData((prev) => ({ ...prev, question: e.target.value }));
              if (errors.question)
                setErrors((prev) => ({ ...prev, question: "" }));
            }}
            onKeyPress={handleKeyPress}
            placeholder="e.g., Two Sum, Reverse Linked List"
            className={`w-full p-4 border-2 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
              errors.question
                ? "border-red-300 bg-red-50 dark:bg-red-900/10"
                : "border-gray-200 dark:border-gray-600"
            }`}
          />
          {errors.question && (
            <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {errors.question}
            </p>
          )}
        </div>

        {/* LeetCode URL */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            LeetCode URL
          </label>
          <input
            type="url"
            value={formData.url}
            onChange={(e) => {
              setFormData((prev) => ({ ...prev, url: e.target.value }));
              if (errors.url) setErrors((prev) => ({ ...prev, url: "" }));
            }}
            onKeyPress={handleKeyPress}
            placeholder="https://leetcode.com/problems/two-sum/"
            className={`w-full p-4 border-2 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
              errors.url
                ? "border-red-300 bg-red-50 dark:bg-red-900/10"
                : "border-gray-200 dark:border-gray-600"
            }`}
          />
          {errors.url && (
            <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {errors.url}
            </p>
          )}
        </div>

        {/* Difficulty */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Difficulty Level
          </label>
          <div className="grid grid-cols-3 gap-3">
            {["Easy", "Medium", "Hard"].map((difficulty) => (
              <button
                key={difficulty}
                type="button"
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    difficulty: difficulty as "Easy" | "Medium" | "Hard",
                  }))
                }
                className={`p-3 rounded-xl border-2 transition-all font-medium text-sm ${
                  formData.difficulty === difficulty
                    ? `${getDifficultyColor(
                        difficulty
                      )} border-current shadow-md`
                    : "bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600"
                }`}
              >
                {difficulty}
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            onClick={handleSubmit}
            className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Question
          </button>
          <button
            onClick={onClose}
            className="px-6 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-4 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all font-semibold"
          >
            Cancel
          </button>
        </div>
      </div>

      {/* Keyboard shortcut hint */}
      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          Press{" "}
          <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">
            Enter
          </kbd>{" "}
          to submit or{" "}
          <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">
            Esc
          </kbd>{" "}
          to cancel
        </p>
      </div>
    </div>
  );
};
