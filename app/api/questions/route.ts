import { NextResponse } from "next/server";
import clientPromise from "../../lib/mongodb";
import { LeetCodeQuestion } from "@/app/types";
import { ObjectId } from "mongodb";

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
    const newQuestion: Omit<LeetCodeQuestion, "_id"> & {
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
      _id: result.insertedId.toString(),
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

// DELETE question
export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { message: "Missing id parameter" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const database = client.db(process.env.DATABASE);
    const collection = database.collection("LeetcodeQuestions");

    const result = await collection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { message: "Question not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Question deleted successfully" });
  } catch (error) {
    console.error("Error deleting question:", error);
    return NextResponse.json(
      { message: "Failed to delete question" },
      { status: 500 }
    );
  }
}

// PATCH update question (mark as solved)
export async function PATCH(req: Request) {
  try {
    const body: { id: string; revisionWeeks: number } = await req.json();
    const { id, revisionWeeks } = body;

    if (!id || !revisionWeeks) {
      return NextResponse.json(
        { message: "Missing required fields: id and revisionWeeks" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const database = client.db(process.env.DATABASE);
    const collection = database.collection("LeetcodeQuestions");

    const now = new Date();
    const reminderDate = new Date();
    reminderDate.setDate(reminderDate.getDate() + revisionWeeks * 7);

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $set: {
          last_solved: now,
          reminder_date: reminderDate,
        },
      },
      { returnDocument: "after" }
    );
    if (!result) {
      console.log("Question not found");
      return NextResponse.json(
        { message: "Question not found" },
        { status: 404 }
      );
    }

    // Return updated question
    return NextResponse.json({
      message: "Question updated successfully",
      question: {
        _id: result._id.toString(),
        question: result.question,
        url: result.url,
        difficulty: result.difficulty,
        last_solved: result.last_solved,
        reminder_date: result.reminder_date,
      },
    });
  } catch (error) {
    console.error("Error updating question:", error);
    return NextResponse.json(
      { message: "Failed to update question" },
      { status: 500 }
    );
  }
}
