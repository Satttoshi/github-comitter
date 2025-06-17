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
  selected: boolean;
  isSquashed?: boolean;
  originalSquashHash?: string;
  isSquashMerge?: boolean;
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

export async function selectCommitsAction(): Promise<{ success: boolean; error?: string }> {
  try {
    // This action will be used to handle the selection of commits for import
    // In a real implementation, you might want to store these selected commits somewhere
    return { success: true };
  } catch (error) {
    console.error('Error selecting commits:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred'
    };
  }
}

async function parseSquashedCommits(
  git: SimpleGit,
  commitHash: string,
  contributor: Contributor,
  commitDate: string
): Promise<CommitInfo[]> {
  try {
    // Get the full commit message and details
    const result = await git.raw(['show', '--format=%B', '--no-patch', commitHash]);
    const fullMessage = result.trim();

    // Get parent information
    const parents = await git.raw(['show', '--format=%P', '--no-patch', commitHash]);
    const parentHashes = parents.trim().split(' ').filter(h => h.length > 0);

    let subCommits: CommitInfo[] = [];

    // Check if this is a merge commit (has multiple parents)
    if (parentHashes.length === 2) {
      try {
        // Get commits that were merged (from feature branch)
        const mergeRange = `${parentHashes[0]}..${parentHashes[1]}`;

        const squashedCommitsResult = await git.raw(['log', '--pretty=format:%H|%s|%an|%ae|%ad', '--date=iso', mergeRange]);

        if (squashedCommitsResult && squashedCommitsResult.trim()) {
          const squashedCommitLines = squashedCommitsResult.trim().split('\n');

          if (squashedCommitLines.length > 0) {
            subCommits = squashedCommitLines.map((line, index) => {
              const parts = line.split('|');
              const hash = parts[0] || `${commitHash.substring(0, 7)}-${index}`;
              const message = parts[1] || 'Squashed commit';
              const author = parts[2] || contributor.name;
              const email = parts[3] || contributor.email;
              const date = parts[4] || commitDate;

              return {
                hash,
                message,
                date,
                author,
                email,
                selected: true,
                isSquashed: true,
                originalSquashHash: commitHash
              };
            });

            return subCommits;
          }
        }
      } catch (mergeError) {
        // Silently continue to other checks
      }
    }

    // Check for GitHub squash merge patterns in commit message
    // These commits have patterns like "* feat: some feature" in their messages
    const squashPatterns = [
      /^\*\s+([a-f0-9]{7,40})\s+(.+)$/gm, // GitHub squash with hash: "* abc1234 commit message"
      /^\*\s+(.+)$/gm, // GitHub squash format: "* feat: commit message"
      /^-\s+(.+)$/gm, // Simple dash format: "- commit message"
      /^\d+\.\s+(.+)$/gm, // Numbered format: "1. commit message"
    ];

    for (const pattern of squashPatterns) {
      const matches = Array.from(fullMessage.matchAll(pattern));

      if (matches.length > 1) {
        subCommits = matches.map((match, index) => {
          let subHash: string;
          let subMessage: string;

          if (pattern.source.includes('([a-f0-9]{7,40})')) {
            // Pattern includes hash capture group
            subHash = match[1];
            subMessage = match[2] || match[1];
          } else {
            // Pattern only captures message, generate pseudo-hash
            subHash = `${commitHash.substring(0, 7)}-${index}`;
            subMessage = match[1];
          }

          return {
            hash: subHash,
            message: subMessage,
            date: commitDate,
            author: contributor.name,
            email: contributor.email,
            selected: true,
            isSquashed: true,
            originalSquashHash: commitHash
          };
        });

        if (subCommits.length > 0) {
          return subCommits;
        }
      }
    }
    return [];
  } catch (error) {
    console.error('Error parsing squashed commits:', error);
    return [];
  }
}

export async function extractCommitsAction(
  repositoryPath: string,
  contributors: Contributor[],
  fromDate: string,
  toDate: string
): Promise<{ commits: CommitInfo[]; error?: string }> {
  try {
    // Normalize path for cross-platform compatibility
    const normalizedPath = path.normalize(repositoryPath);

    // Initialize git in the specified directory
    const git: SimpleGit = simpleGit(normalizedPath);

    // Create an array to store all commits
    const allCommits: CommitInfo[] = [];

    // Extract commits for each contributor
    for (const contributor of contributors) {
      try {
        // Create author filter string
        const authorFilter = `${contributor.name} <${contributor.email}>`;

        // Get commits for this contributor in the date range
        // Use --date-order to ensure commits are ordered by date
        const logOptions = [
          `--author=${authorFilter}`,
          `--since=${fromDate}`,
          `--until=${toDate}`,
          '--date=iso',
          '--date-order',
          '--pretty=format:%H|%s|%ad|%an|%ae'
        ];

        // Use git.log instead of git.raw for better handling
        const result = await git.raw(['log', ...logOptions]);

        if (result && result.trim() !== '') {
          // Parse the commit log
          const commits = result
            .split('\n')
            .filter(line => line.trim() !== '')
            .map(line => {
              const parts = line.split('|');
              // Handle case where commit message might contain the delimiter
              if (parts.length >= 5) {
                const hash = parts[0];
                const message = parts.slice(1, parts.length - 3).join('|');
                const date = parts[parts.length - 3];
                const author = parts[parts.length - 2];
                const email = parts[parts.length - 1];

                return {
                  hash,
                  message,
                  date,
                  author,
                  email,
                  selected: true // Default to selected
                };
              }
              return null;
            })
            .filter((commit): commit is CommitInfo => commit !== null);

          // Check each commit for squashed content and add both original and subcommits
          for (const commit of commits) {
            const squashedCommits = await parseSquashedCommits(git, commit.hash, contributor, commit.date);
            if (squashedCommits.length > 0) {
              // Mark the original commit as a squash merge and add it
              const squashMergeCommit = {
                ...commit,
                isSquashMerge: true
              };
              allCommits.push(squashMergeCommit);
              // Also add all the extracted subcommits
              allCommits.push(...squashedCommits);
            } else {
              // Not a squashed commit, add as is
              allCommits.push(commit);
            }
          }
        } else {
          // No commits found for this contributor
        }
      } catch (contributorError) {
        console.error(`Error processing contributor ${contributor.name}:`, contributorError);
        // Continue with next contributor instead of failing the whole operation
      }
    }

    // Remove duplicates based on a composite key: message + date + author
    const seenCommits = new Set<string>();
    const uniqueCommits: CommitInfo[] = [];
    let duplicatesRemoved = 0;

    for (const commit of allCommits) {
      // Create a composite key to identify truly duplicate commits
      const commitKey = `${commit.message}|${commit.date}|${commit.author}|${commit.email}`;

      if (!seenCommits.has(commitKey)) {
        seenCommits.add(commitKey);
        uniqueCommits.push(commit);
      } else {
        duplicatesRemoved++;
      }
    }

    // Sort commits by date (newest first)
    uniqueCommits.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return { commits: uniqueCommits };
  } catch (error) {
    console.error('Error extracting commits:', error);
    return {
      commits: [],
      error: error instanceof Error ? error.message : 'An unknown error occurred'
    };
  }
}
