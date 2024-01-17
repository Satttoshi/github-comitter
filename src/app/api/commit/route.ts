import fs from 'fs';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';
import simpleGit from 'simple-git';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const customDate = formData.get('customTime') + 'T13:37:00';
    const commitMessage = formData.get('commitMessage');
    console.log(customDate, commitMessage);

    const filePath = path.join(process.cwd(), 'src', 'commits', 'COMMITS.md');
    const currentContent = fs.readFileSync(filePath, 'utf8');
    const newLine = `Commit created at ${new Date().toISOString()}, message '${commitMessage}' custom Time at ${customDate}\n`;
    fs.writeFileSync(filePath, currentContent + newLine);

    const git = simpleGit();
    await git.add(filePath);
    await git.raw([
      'commit',
      '-m',
      `auto-commit: ${commitMessage}: ${customDate}`,
      '--date',
      customDate,
    ]);

    await git.push();

    return NextResponse.json({
      status: 200,
      message: newLine,
    });
  } catch (err: any) {
    console.error(err);
    return new Response(err.message, { status: 500 });
  }
}
