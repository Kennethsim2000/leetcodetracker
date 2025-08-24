"use client";

import React, { useState, useEffect } from "react";
import { Plus, Search } from "lucide-react";
import { LeetCodeQuestion, TabType } from "./types";
import { isQuestionDue } from "./utils";
import { QuestionsList } from "./components/QuestionList";
import { AddQuestionModal } from "./components/AddQuestionModal";
import { RevisionModal } from "./components/RevisionModal";

export default function LeetCodeTracker() {
  const [questions, setQuestions] = useState<LeetCodeQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [selectedQuestionForRevision, setSelectedQuestionForRevision] =
    useState<{
      id: string;
      name: string;
    } | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTab, setSelectedTab] = useState<TabType>("all");

  // Fetch questions from database
  const fetchQuestions = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/questions");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch questions");
      }

      // Transform dates from strings to Date objects
      const transformedQuestions = data.questions.map(
        (q: LeetCodeQuestion) => ({
          ...q,
          last_solved: q.last_solved ? new Date(q.last_solved) : null,
          reminder_date: q.reminder_date ? new Date(q.reminder_date) : null,
        })
      );

      setQuestions(transformedQuestions);
    } catch (error) {
      console.error("Error fetching questions:", error);
      setError(
        error instanceof Error ? error.message : "Failed to load questions"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize by fetching from database
  useEffect(() => {
    fetchQuestions();
  }, []);

  // Add question via API
  const addQuestion = async (
    questionData: Omit<LeetCodeQuestion, "id" | "last_solved" | "reminder_date">
  ) => {
    try {
      const response = await fetch("/api/questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(questionData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to add question");
      }

      // Add the new question to the local state
      const newQuestion = {
        ...data.question,
        last_solved: data.question.last_solved
          ? new Date(data.question.last_solved)
          : null,
        reminder_date: data.question.reminder_date
          ? new Date(data.question.reminder_date)
          : null,
      };

      setQuestions((prev) => [newQuestion, ...prev]);
      setShowAddForm(false);
    } catch (error) {
      console.error("Error adding question:", error);
      // Error handling is done in the modal
      throw error;
    }
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

  // Mark as solved with API call
  const markAsSolved = async (id: string, revisionWeeks: number) => {
    try {
      const response = await fetch("/api/questions", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, revisionWeeks }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update question");
      }

      // Update the local state
      setQuestions((prev) =>
        prev.map((q) => {
          if (q.id === id) {
            return {
              ...q,
              last_solved: new Date(data.question.last_solved),
              reminder_date: new Date(data.question.reminder_date),
            };
          }
          return q;
        })
      );

      // Close the revision modal
      setShowRevisionModal(false);
      setSelectedQuestionForRevision(null);
    } catch (error) {
      console.error("Error marking question as solved:", error);
      // You might want to show an error message to the user here
    }
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

  // Delete question via API
  const deleteQuestion = async (id: string) => {
    try {
      const response = await fetch(`/api/questions?id=${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete question");
      }

      // Remove from local state
      setQuestions((prev) => prev.filter((q) => q.id !== id));
    } catch (error) {
      console.error("Error deleting question:", error);
      // You might want to show an error message to the user here
    }
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Loading questions...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-800 rounded-xl p-6">
            <svg
              className="w-12 h-12 text-red-500 mx-auto mb-4"
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
            <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
              Error Loading Questions
            </h3>
            <p className="text-red-600 dark:text-red-300 mb-4">{error}</p>
            <button
              onClick={fetchQuestions}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

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

        {/* Empty State */}
        {questions.length === 0 && (
          <div className="text-center py-12">
            <svg
              className="w-16 h-16 text-gray-400 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No questions yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Start tracking your LeetCode progress by adding your first
              question.
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Your First Question
            </button>
          </div>
        )}
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
