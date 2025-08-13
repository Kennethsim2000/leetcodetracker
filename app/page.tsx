// LeetCodeTracker.tsx

"use client";

import React, { useState, useEffect } from "react";
import { Plus, Search } from "lucide-react";
import { LeetCodeQuestion, TabType } from "./types";
import { isQuestionDue } from "./utils";
import { QuestionsList } from "./components/QuestionList";
import { AddQuestionModal } from "./components/AddQuestionModal";
import { RevisionModal } from "./components/RevisionModal";

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
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [selectedQuestionForRevision, setSelectedQuestionForRevision] =
    useState<{
      id: string;
      name: string;
    } | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTab, setSelectedTab] = useState<TabType>("all");

  // Initialize with sample data
  useEffect(() => {
    setQuestions(sampleQuestions);
  }, []);

  //TODO: Add call to backend to insert a new question into the database
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

  // Modified to show revision modal instead of immediately marking as solved
  const handleMarkSolved = (id: string) => {
    const question = questions.find((q) => q.id === id);
    if (question) {
      setSelectedQuestionForRevision({
        id: question.id,
        name: question.question,
      });
      setShowRevisionModal(true);
    }
  };

  // New function to actually mark as solved with custom revision period
  const markAsSolved = (id: string, revisionWeeks: number) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id === id) {
          const nextReviewDate = new Date();
          nextReviewDate.setDate(nextReviewDate.getDate() + revisionWeeks * 7);

          return {
            ...q,
            last_solved: new Date(),
            reminder_date: nextReviewDate,
          };
        }
        return q;
      })
    );

    // Close the revision modal
    setShowRevisionModal(false);
    setSelectedQuestionForRevision(null);
  };

  const handleRevisionConfirm = (weeks: number) => {
    if (selectedQuestionForRevision) {
      markAsSolved(selectedQuestionForRevision.id, weeks);
    }
  };

  const handleRevisionClose = () => {
    setShowRevisionModal(false);
    setSelectedQuestionForRevision(null);
  };

  //TODO: Add api call to backend to delete a question from the backend
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
          onMarkSolved={handleMarkSolved}
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

      {/* Revision Modal */}
      {showRevisionModal && selectedQuestionForRevision && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-300">
          <RevisionModal
            questionName={selectedQuestionForRevision.name}
            onConfirm={handleRevisionConfirm}
            onClose={handleRevisionClose}
          />
        </div>
      )}
    </div>
  );
}
