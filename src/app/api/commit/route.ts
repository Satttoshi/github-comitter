import fs from 'fs';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';
import simpleGit from 'simple-git';
import { currentTimeZoneToIsoString } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const customDate = formData.get('customTime') + ':00';
    let commitMessage = formData.get('commitMessage');
    if (!commitMessage) {
      commitMessage = 'empty';
    }
    const commitAmount = formData.get('commitAmount');
    console.log(customDate, commitMessage, commitAmount);

    const filePath = path.join(process.cwd(), 'src', 'commits', 'COMMITS.md');
    const currentContent = fs.readFileSync(filePath, 'utf8');
    const newLine = `Commit created at ${currentTimeZoneToIsoString()}, message '${commitMessage}' custom Time set at ${customDate}\n`;
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
