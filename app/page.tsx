"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  ExternalLink,
  Calendar,
  CheckCircle,
} from "lucide-react";

interface LeetCodeQuestion {
  id: string;
  question: string;
  url: string;
  difficulty: string;
  last_solved: Date | null;
  reminder_date: Date | null;
}

// Calculate next review date based on solve count
const calculateNextReviewDate = (solveCount: number): Date => {
  const intervals = [1, 7, 30, 60]; // 1 day, 1 week, 1 month, 2 months
  const days = intervals[Math.min(solveCount - 1, intervals.length - 1)];
  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
};

const isQuestionDue = (question: LeetCodeQuestion): boolean => {
  if (!question.reminder_date) return true; // New questions are always due
  return new Date() >= new Date(question.reminder_date);
};

// Sample data
const sampleQuestions: LeetCodeQuestion[] = [
  {
    id: "1",
    question: "Two Sum",
    url: "https://leetcode.com/problems/two-sum/",
    difficulty: "Easy",
    last_solved: new Date("2024-07-15"),
    reminder_date: new Date("2024-08-15"),
  },
  {
    id: "2",
    question: "Add Two Numbers",
    url: "https://leetcode.com/problems/add-two-numbers/",
    difficulty: "Medium",
    last_solved: null,
    reminder_date: null,
  },
  {
    id: "3",
    question: "Longest Substring Without Repeating Characters",
    url: "https://leetcode.com/problems/longest-substring-without-repeating-characters/",
    difficulty: "Medium",
    last_solved: new Date("2024-07-01"),
    reminder_date: new Date("2024-08-01"),
  },
];

export default function LeetCodeTracker() {
  const [questions, setQuestions] = useState<LeetCodeQuestion[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTab, setSelectedTab] = useState<"all" | "due" | "completed">(
    "all"
  );

  // Load data from localStorage on component mount
  useEffect(() => {
    const saved = localStorage.getItem("leetcode-questions");
    if (saved) {
      const parsed = JSON.parse(saved);
      // Convert date strings back to Date objects
      const questionsWithDates = parsed.map((q: LeetCodeQuestion) => ({
        ...q,
        last_solved: q.last_solved ? new Date(q.last_solved) : null,
        reminder_date: q.reminder_date ? new Date(q.reminder_date) : null,
      }));
      setQuestions(questionsWithDates);
    } else {
      setQuestions(sampleQuestions);
    }
  }, []);

  // Save to localStorage whenever questions change
  useEffect(() => {
    if (questions.length > 0) {
      localStorage.setItem("leetcode-questions", JSON.stringify(questions));
    }
  }, [questions]);

  const addQuestion = (
    questionData: Omit<LeetCodeQuestion, "id" | "last_solved" | "reminder_date">
  ) => {
    const newQuestion: LeetCodeQuestion = {
      id: Date.now().toString(),
      ...questionData,
      last_solved: null,
      reminder_date: null,
    };

    setQuestions((prev) => [...prev, newQuestion]);
    setShowAddForm(false);
  };

  const markAsSolved = (id: string) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id === id) {
          const solveCount = q.last_solved
            ? Math.floor(
                (new Date().getTime() - q.last_solved.getTime()) /
                  (1000 * 60 * 60 * 24 * 30)
              ) + 1
            : 1;
          const nextReviewDate = calculateNextReviewDate(solveCount);

          return {
            ...q,
            last_solved: new Date(),
            reminder_date: nextReviewDate,
          };
        }
        return q;
      })
    );
  };

  const deleteQuestion = (id: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  // Filter questions based on selected tab and search
  const filteredQuestions = questions.filter((question) => {
    const matchesSearch = question.question
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    switch (selectedTab) {
      case "due":
        return isQuestionDue(question);
      case "completed":
        return question.last_solved !== null;
      default:
        return true;
    }
  });

  const dueCount = questions.filter(isQuestionDue).length;
  const completedCount = questions.filter((q) => q.last_solved !== null).length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            LeetCode Tracker
          </h1>
          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <span>Total: {questions.length}</span>
            <span className="text-red-600 font-medium">Due: {dueCount}</span>
            <span className="text-green-600 font-medium">
              Completed: {completedCount}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search questions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex gap-2">
            {(["all", "due", "completed"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab)}
                className={`px-4 py-2 rounded-lg capitalize transition-colors ${
                  selectedTab === tab
                    ? "bg-blue-500 text-white"
                    : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                {tab}
                {tab === "due" && dueCount > 0 && ` (${dueCount})`}
                {tab === "completed" &&
                  completedCount > 0 &&
                  ` (${completedCount})`}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Question
          </button>
        </div>

        {/* Questions List */}
        <div className="space-y-4">
          {filteredQuestions.map((question) => {
            const isDue = isQuestionDue(question);
            const daysSinceLastSolved = question.last_solved
              ? Math.floor(
                  (new Date().getTime() - question.last_solved.getTime()) /
                    (1000 * 60 * 60 * 24)
                )
              : null;

            return (
              <div
                key={question.id}
                className={`bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border-l-4 transition-all hover:shadow-md ${
                  isDue ? "border-l-red-500" : "border-l-green-500"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {question.question}
                      </h3>
                      <a
                        href={question.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-600 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>

                    <div className="flex items-center gap-4 mb-3">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          question.difficulty === "Easy"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : question.difficulty === "Medium"
                            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                        }`}
                      >
                        {question.difficulty}
                      </span>

                      {isDue && (
                        <span className="px-2 py-1 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 rounded text-xs font-medium">
                          Due for Review
                        </span>
                      )}
                    </div>

                    <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      {question.last_solved ? (
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span>
                            Last solved:{" "}
                            {question.last_solved.toLocaleDateString()} (
                            {daysSinceLastSolved} days ago)
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-orange-500" />
                          <span className="text-orange-600 dark:text-orange-400 font-medium">
                            Never solved
                          </span>
                        </div>
                      )}

                      {question.reminder_date && (
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span
                            className={isDue ? "text-red-600 font-medium" : ""}
                          >
                            Next review:{" "}
                            {question.reminder_date.toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => markAsSolved(question.id)}
                      className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors text-sm"
                    >
                      Mark Solved
                    </button>
                    <button
                      onClick={() => deleteQuestion(question.id)}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredQuestions.length === 0 && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <div className="text-6xl mb-4">📝</div>
            <p className="text-lg">No questions found</p>
            <p className="text-sm">
              Add some LeetCode questions to get started!
            </p>
          </div>
        )}

        {/* Add Question Modal */}
        {showAddForm && (
          <AddQuestionModal
            onAdd={addQuestion}
            onClose={() => setShowAddForm(false)}
          />
        )}
      </div>
    </div>
  );
}

// Add Question Modal Component
function AddQuestionModal({
  onAdd,
  onClose,
}: {
  onAdd: (
    question: Omit<LeetCodeQuestion, "id" | "last_solved" | "reminder_date">
  ) => void;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState({
    question: "",
    url: "",
    difficulty: "",
  });

  const handleSubmit = () => {
    if (formData.question.trim() && formData.url.trim()) {
      onAdd(formData);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
          Add New Question
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Question Name *
            </label>
            <input
              type="text"
              value={formData.question}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, question: e.target.value }))
              }
              onKeyPress={handleKeyPress}
              placeholder="e.g., Two Sum"
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              LeetCode URL *
            </label>
            <input
              type="url"
              value={formData.url}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, url: e.target.value }))
              }
              onKeyPress={handleKeyPress}
              placeholder="https://leetcode.com/problems/..."
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Difficulty
            </label>
            <select
              value={formData.difficulty}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  difficulty: e.target.value,
                }))
              }
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={handleSubmit}
              disabled={!formData.question.trim() || !formData.url.trim()}
              className="flex-1 bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Add Question
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 rounded hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
