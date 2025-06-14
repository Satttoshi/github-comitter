'use server';

import { simpleGit, SimpleGit } from 'simple-git';
import path from 'path';
import fs from 'fs';

export interface Contributor {
  name: string;
  email: string;
  commitCount: number;
}

export interface CommitInfo {
  hash: string;
  message: string;
  date: string;
  author: string;
  email: string;
  selected?: boolean;
}

export async function validateRepository(repositoryPath: string): Promise<{ valid: boolean; error?: string }> {
  try {
    // Normalize path for cross-platform compatibility
    const normalizedPath = path.normalize(repositoryPath);

    // Check if path exists
    if (!fs.existsSync(normalizedPath)) {
      return { valid: false, error: 'Repository path does not exist' };
    }

    // Check if path is a directory
    const stats = fs.statSync(normalizedPath);
    if (!stats.isDirectory()) {
      return { valid: false, error: 'Repository path is not a directory' };
    }

    // Initialize git in the specified directory
    const git: SimpleGit = simpleGit(normalizedPath);

    // Check if it's a git repository
    const isRepo = await git.checkIsRepo();

    if (!isRepo) {
      return { valid: false, error: 'The specified directory is not a Git repository' };
    }

    return { valid: true };
  } catch (error) {
    console.error('Error validating repository:', error);
    return { 
      valid: false, 
      error: error instanceof Error ? error.message : 'An unknown error occurred' 
    };
  }
}

export async function scanContributors(repositoryPath: string): Promise<{ contributors: Contributor[]; error?: string }> {
  try {
    // Normalize path for cross-platform compatibility
    const normalizedPath = path.normalize(repositoryPath);

    // Initialize git in the specified directory
    const git: SimpleGit = simpleGit(normalizedPath);

    // Get all logs to extract contributors
    const logSummary = await git.log(['--all']);

    // Process logs to extract unique contributors
    const contributorsMap = new Map<string, Contributor>();

    logSummary.all.forEach(commit => {
      const key = `${commit.author_name}<${commit.author_email}>`;

      if (contributorsMap.has(key)) {
        const contributor = contributorsMap.get(key)!;
        contributor.commitCount += 1;
      } else {
        contributorsMap.set(key, {
          name: commit.author_name,
          email: commit.author_email,
          commitCount: 1
        });
      }
    });

    // Convert map to array and sort by commit count (descending)
    const contributors = Array.from(contributorsMap.values())
      .sort((a, b) => b.commitCount - a.commitCount);

    return { contributors };
  } catch (error) {
    console.error('Error scanning contributors:', error);
    return { 
      contributors: [],
      error: error instanceof Error ? error.message : 'An unknown error occurred' 
    };
  }
}

export async function selectCommitsAction(commits: CommitInfo[]): Promise<{ success: boolean; error?: string }> {
  try {
    // This action will be used to handle the selection of commits for import
    // In a real implementation, you might want to store these selected commits somewhere
    console.log(`Selected ${commits.length} commits for import`);

    return { success: true };
  } catch (error) {
    console.error('Error selecting commits:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unknown error occurred' 
    };
  }
}

export async function extractCommitsAction(
  repositoryPath: string,
  contributors: Contributor[],
  fromDate: string,
  toDate: string
): Promise<{ commits: CommitInfo[]; error?: string }> {
  console.log('extractCommits called with:', { repositoryPath, contributors, fromDate, toDate });

  try {
    // Normalize path for cross-platform compatibility
    const normalizedPath = path.normalize(repositoryPath);
    console.log('Normalized path:', normalizedPath);

    // Initialize git in the specified directory
    const git: SimpleGit = simpleGit(normalizedPath);

    // Create an array to store all commits
    const allCommits: CommitInfo[] = [];

    // Extract commits for each contributor
    for (const contributor of contributors) {
      console.log('Processing contributor:', contributor);

      // Create author filter string - remove quotes to avoid issues with shell escaping
      const authorFilter = `${contributor.name} <${contributor.email}>`;
      console.log('Author filter:', authorFilter);

      // Get commits for this contributor in the date range
      // Fix: Remove quotes from the author filter as simple-git will handle escaping
      const logOptions = [
        '--author=' + authorFilter,
        '--since=' + fromDate,
        '--until=' + toDate,
        '--date=iso',
        '--pretty=format:%H|%s|%ad|%an|%ae'
      ];
      console.log('Git log options:', logOptions);

      const result = await git.raw(['log', ...logOptions]);
      console.log('Git log result length:', result ? result.length : 0);
      console.log('Git log result sample:', result ? result.substring(0, 200) + '...' : 'empty');

      if (result) {
        // Parse the commit log
        const commits = result
          .split('\n')
          .filter(line => line.trim() !== '')
          .map(line => {
            const [hash, message, date, author, email] = line.split('|');
            return {
              hash,
              message,
              date,
              author,
              email,
              selected: true // Default to selected
            };
          });

        console.log(`Found ${commits.length} commits for contributor ${contributor.name}`);
        allCommits.push(...commits);
      } else {
        console.log(`No commits found for contributor ${contributor.name}`);
      }
    }

    // Sort commits by date (newest first)
    allCommits.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    console.log(`Total commits found: ${allCommits.length}`);

    return { commits: allCommits };
  } catch (error) {
    console.error('Error extracting commits:', error);
    return { 
      commits: [],
      error: error instanceof Error ? error.message : 'An unknown error occurred' 
    };
  }
}
