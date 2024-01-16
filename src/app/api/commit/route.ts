import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';
import simpleGit from 'simple-git';

export async function POST() {
  try {
    // Define the path to the COMMIT.md file
    const filePath = path.join(process.cwd(), 'src', 'commits', 'COMMITS.md');

    // Read the current content of the file
    const currentContent = fs.readFileSync(filePath, 'utf8');

    // Prepare the new line to be added
    const newLine = `New commit made at ${new Date().toISOString()}\n`;

    // Write the new line to the file
    fs.writeFileSync(filePath, currentContent + newLine);

    // Initialize simple-git
    const git = simpleGit();

    // Add and commit the changes
    await git.add(filePath);
    await git.commit('Auto-commit: Updated COMMITS.md');

    return NextResponse.json({
      status: 200,
      message: 'Commit file updated and changes committed',
    });
  } catch (err: any) {
    console.error(err);
    return new Response(err.message, { status: 500 });
  }
}
