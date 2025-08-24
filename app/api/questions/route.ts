import { NextResponse } from "next/server";
import clientPromise from "../../lib/mongodb";
import { LeetCodeQuestion } from "@/app/types";

export const dynamic = "force-dynamic";

// GET all questions
export async function GET(req: Request) {
  try {
    const client = await clientPromise;
    const database = client.db(process.env.DATABASE);
    const collection = database.collection("LeetcodeQuestions");

    const questions = await collection
      .find({})
      .sort({ created_at: -1 })
      .toArray();

    return NextResponse.json({ questions });
  } catch (error) {
    console.error("Error fetching questions:", error);
    return NextResponse.json(
      { message: "Failed to fetch questions" },
      { status: 500 }
    );
  }
}

// POST new question
export async function POST(req: Request) {
  try {
    const client = await clientPromise;
    const database = client.db(process.env.DATABASE);
    const collection = database.collection("LeetcodeQuestions");

    const body = await req.json();
    const { question, url, difficulty } = body;

    // Validate required fields
    if (!question || !url || !difficulty) {
      return NextResponse.json(
        {
          message:
            "Missing required fields: question, url, and difficulty are required",
        },
        { status: 400 }
      );
    }

    // Validate difficulty
    if (!["Easy", "Medium", "Hard"].includes(difficulty)) {
      return NextResponse.json(
        { message: "Invalid difficulty. Must be Easy, Medium, or Hard" },
        { status: 400 }
      );
    }

    // Validate URL format
    if (!url.includes("leetcode.com")) {
      return NextResponse.json(
        { message: "Invalid URL. Must be a LeetCode URL" },
        { status: 400 }
      );
    }

    // Check if question with same URL already exists
    const existingQuestion = await collection.findOne({ url: url.trim() });
    if (existingQuestion) {
      return NextResponse.json(
        { message: "Question with this URL already exists" },
        { status: 409 }
      );
    }

    // Construct the new question document
    const newQuestion: Omit<LeetCodeQuestion, "id"> & {
      created_at: Date;
    } = {
      question: question.trim(),
      url: url.trim(),
      difficulty: difficulty as "Easy" | "Medium" | "Hard",
      last_solved: new Date(),
      reminder_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks later
      created_at: new Date(),
    };

    const result = await collection.insertOne(newQuestion);

    // Match your LeetCodeQuestion type for the response
    const createdQuestion: LeetCodeQuestion = {
      id: result.insertedId.toString(),
      question: newQuestion.question,
      url: newQuestion.url,
      difficulty: newQuestion.difficulty,
      last_solved: newQuestion.last_solved,
      reminder_date: newQuestion.reminder_date,
    };

    return NextResponse.json(
      {
        message: "Question added successfully",
        question: createdQuestion,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding question:", error);
    return NextResponse.json(
      { message: "Failed to add question" },
      { status: 500 }
    );
  }
}
