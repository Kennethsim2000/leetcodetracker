// components/QuestionsList.tsx

import React from "react";
import { ExternalLink, CheckCircle, Calendar } from "lucide-react";
import { LeetCodeQuestion } from "../types";
import { isQuestionDue, getDifficultyColor } from "../utils";

interface QuestionsListProps {
  questions: LeetCodeQuestion[];
  onMarkSolved: (id: string) => void;
  onDelete: (id: string) => void;
}

export const QuestionsList: React.FC<QuestionsListProps> = ({
  questions,
  onMarkSolved,
  onDelete,
}) => {
  if (questions.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        <div className="text-6xl mb-4">📝</div>
        <p className="text-lg">No questions found</p>
        <p className="text-sm">Add some LeetCode questions to get started!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {questions.map((question) => {
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
                    className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(
                      question.difficulty
                    )}`}
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
                        {question.last_solved.toLocaleDateString("en-GB")} (
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
                      <span className={isDue ? "text-red-600 font-medium" : ""}>
                        Next review:{" "}
                        {question.reminder_date.toLocaleDateString("en-GB")}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => onMarkSolved(question.id)}
                  className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors text-sm"
                >
                  Mark Solved
                </button>
                <button
                  onClick={() => onDelete(question.id)}
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
  );
};
