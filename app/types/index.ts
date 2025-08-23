export interface LeetCodeQuestion {
  id: string;
  question: string;
  url: string;
  difficulty: "Easy" | "Medium" | "Hard";
  last_solved: Date | null;
  reminder_date: Date | null;
}

export type TabType = "all" | "due" | "completed";
