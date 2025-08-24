import { LeetCodeQuestion } from "../types";

// Calculate next review date based on solve count
export const calculateNextReviewDate = (solveCount: number): Date => {
  const intervals = [1, 7, 30, 60]; // 1 day, 1 week, 1 month, 2 months
  const days = intervals[Math.min(solveCount - 1, intervals.length - 1)];
  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
};

export const isQuestionDue = (question: LeetCodeQuestion): boolean => {
  if (!question.reminder_date) return true; // question must have a reminder date
  return new Date() >= new Date(question.reminder_date);
};

export const getDifficultyColor = (difficulty: string): string => {
  switch (difficulty) {
    case "Easy":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    case "Medium":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
    case "Hard":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
  }
};
