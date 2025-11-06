import { NextResponse } from "next/server";
import clientPromise from "../../lib/mongodb";
import { LeetCodeQuestion } from "@/app/types";
import { ObjectId } from "mongodb";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const client = await clientPromise;
    const database = client.db(process.env.DATABASE);
    const collection = database.collection("LeetcodeQuestions");

    const now = new Date();
    const dueQuestions = await collection
      .find({
        reminder_date: { $lte: now },
      })
      .sort({ reminder_date: 1 })
      .toArray();

    return NextResponse.json({ questions: dueQuestions });
  } catch (error) {
    console.error("Error fetching due questions:", error);
    return NextResponse.json(
      { message: "Failed to fetch due questions" },
      { status: 500 }
    );
  }
}
