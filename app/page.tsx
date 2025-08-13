// LeetCodeTracker.tsx

"use client";

import React, { useState, useEffect } from "react";
import { Plus, Search } from "lucide-react";
import { LeetCodeQuestion, TabType } from "./types";
import { calculateNextReviewDate, isQuestionDue } from "./utils";
import { QuestionsList } from "./components/QuestionList";
import { AddQuestionModal } from "./components/AddQuestionModal";

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
  const [selectedTab, setSelectedTab] = useState<TabType>("all");

  // Initialize with sample data
  useEffect(() => {
    setQuestions(sampleQuestions);
  }, []);

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 relative">
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
          {/* Search */}
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

          {/* Tab Buttons */}
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

          {/* Add Button */}
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Question
          </button>
        </div>

        {/* Questions List */}
        <QuestionsList
          questions={filteredQuestions}
          onMarkSolved={markAsSolved}
          onDelete={deleteQuestion}
        />
      </div>

      {/* Add Question Modal */}
      {showAddForm && (
        <div className="fixed top-8 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-top-4 duration-300">
          <AddQuestionModal
            onAdd={addQuestion}
            onClose={() => setShowAddForm(false)}
          />
        </div>
      )}
    </div>
  );
}
