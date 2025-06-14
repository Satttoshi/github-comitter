'use server';

import { simpleGit, SimpleGit } from 'simple-git';
import path from 'path';
import fs from 'fs';
import { CommitInfo } from './repository';

export async function importCommitsAction(
  commits: CommitInfo[],
  targetRepository: string = process.cwd()
): Promise<{ success: boolean; importedCount: number; error?: string }> {
  console.log(`Importing ${commits.length} commits to ${targetRepository}`);
  
  try {
    // Normalize path for cross-platform compatibility
    const normalizedPath = path.normalize(targetRepository);
    
    // Initialize git in the target directory
    const git: SimpleGit = simpleGit(normalizedPath);
    
    // Check if it's a git repository
    const isRepo = await git.checkIsRepo();
    if (!isRepo) {
      return { 
        success: false, 
        importedCount: 0,
        error: 'The target directory is not a Git repository' 
      };
    }
    
    // Path to the COMMITS.md file
    const commitsFilePath = path.join(normalizedPath, 'src', 'commits', 'COMMITS.md');
    
    // Ensure the directory exists
    const commitsDir = path.dirname(commitsFilePath);
    if (!fs.existsSync(commitsDir)) {
      fs.mkdirSync(commitsDir, { recursive: true });
    }
    
    // Create or append to the COMMITS.md file
    let commitsContent = '';
    if (fs.existsSync(commitsFilePath)) {
      commitsContent = fs.readFileSync(commitsFilePath, 'utf-8');
    } else {
      commitsContent = '# Imported Commits\n\nThis file contains a record of commits imported from other repositories.\n\n';
    }
    
    // Add the new commits
    commitsContent += '\n## Import Session ' + new Date().toISOString() + '\n\n';
    
    let importedCount = 0;
    
    // Process each commit
    for (const commit of commits) {
      if (!commit.selected) continue;
      
      // Add entry to COMMITS.md
      commitsContent += `- **${commit.date}**: ${commit.message} (by ${commit.author})\n`;
      
      // Add and commit the changes with the original date
      try {
        // Update the file
        fs.writeFileSync(commitsFilePath, commitsContent);
        
        // Add the file
        await git.add(commitsFilePath);
        
        // Commit with the original date
        const commitOptions = [
          '-m', commit.message,
          '--date', commit.date,
          '--author', `${commit.author} <${commit.email}>`
        ];
        
        await git.raw(['commit', ...commitOptions]);
        importedCount++;
        
      } catch (commitError) {
        console.error('Error creating commit:', commitError);
        // Continue with next commit instead of failing the whole operation
      }
    }
    
    // Push the changes if any commits were imported
    if (importedCount > 0) {
      try {
        await git.push();
      } catch (pushError) {
        console.error('Error pushing commits:', pushError);
        return { 
          success: true, 
          importedCount,
          error: 'Commits were created but could not be pushed to the remote repository' 
        };
      }
    }
    
    return { success: true, importedCount };
  } catch (error) {
    console.error('Error importing commits:', error);
    return { 
      success: false, 
      importedCount: 0,
      error: error instanceof Error ? error.message : 'An unknown error occurred' 
    };
  }
}