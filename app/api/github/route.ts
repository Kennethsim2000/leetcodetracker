import { NextResponse } from "next/server";

const GITHUB_API = "https://api.github.com";

const headers = {
  Accept: "application/vnd.github+json",
  Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
  "X-GitHub-Api-Version": "2022-11-28",
};

export async function POST() {
  try {
    const owner = process.env.GITHUB_OWNER!;
    const repo = process.env.GITHUB_REPO!;
    const branch = process.env.GITHUB_BRANCH || "main";

    // 1. Get the current branch
    const refResponse = await fetch(
      `${GITHUB_API}/repos/${owner}/${repo}/git/ref/heads/${branch}`,
      { headers },
    );

    if (!refResponse.ok) {
      throw new Error(`Failed to get branch: ${await refResponse.text()}`);
    }

    const ref = await refResponse.json();
    const parentSha = ref.object.sha;

    // 2. Get the current commit
    const commitResponse = await fetch(
      `${GITHUB_API}/repos/${owner}/${repo}/git/commits/${parentSha}`,
      { headers },
    );

    if (!commitResponse.ok) {
      throw new Error(`Failed to get commit: ${await commitResponse.text()}`);
    }

    const parentCommit = await commitResponse.json();

    // 3. Create a new commit using the SAME tree
    const newCommitResponse = await fetch(
      `${GITHUB_API}/repos/${owner}/${repo}/git/commits`,
      {
        method: "POST",
        headers: {
          ...headers,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: "Update",
          tree: parentCommit.tree.sha,
          parents: [parentSha],
        }),
      },
    );

    if (!newCommitResponse.ok) {
      throw new Error(
        `Failed to create commit: ${await newCommitResponse.text()}`,
      );
    }

    const newCommit = await newCommitResponse.json();

    // 4. Move the branch to the new commit
    const updateResponse = await fetch(
      `${GITHUB_API}/repos/${owner}/${repo}/git/refs/heads/${branch}`,
      {
        method: "PATCH",
        headers: {
          ...headers,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sha: newCommit.sha,
          force: false,
        }),
      },
    );

    if (!updateResponse.ok) {
      throw new Error(
        `Failed to update branch: ${await updateResponse.text()}`,
      );
    }

    return NextResponse.json({
      success: true,
      sha: newCommit.sha,
      message: "Commit created successfully",
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
