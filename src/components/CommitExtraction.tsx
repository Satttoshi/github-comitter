'use client';

import { useState } from 'react';
import { CommitExtractionForm } from '@/components/CommitExtractionForm';
import { CommitPreviewList } from '@/components/CommitPreviewList';
import { Contributor, CommitInfo, extractCommitsAction } from '@/app/actions/repository';

interface CommitExtractionProps {
  repositoryPath: string;
  contributors: Contributor[];
  onCommitsSelectedAction: (commits: CommitInfo[]) => Promise<void>;
  onBack: () => void;
}

export function CommitExtraction({ 
  repositoryPath, 
  contributors, 
  onCommitsSelectedAction, 
  onBack 
}: CommitExtractionProps) {
  const [commits, setCommits] = useState<CommitInfo[]>([]);
  const [showCommits, setShowCommits] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // This function will be passed to the CommitExtractionForm component
  const handleExtractCommits = async (
    repoPath: string,
    contribs: Contributor[],
    fromDate: string,
    toDate: string
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('Extracting commits with:', { repoPath, contribs, fromDate, toDate });

      const result = await extractCommitsAction(
        repoPath,
        contribs,
        fromDate,
        toDate
      );

      console.log('Extract result:', result);

      if (result.error) {
        setError(result.error);
        return result;
      }

      if (result.commits.length === 0) {
        setError('No commits found in the selected date range for the selected contributors.');
        return result;
      }

      setCommits(result.commits);
      setShowCommits(true);
      return result;
    } catch (err) {
      console.error('Error extracting commits:', err);
      setError('An error occurred while extracting commits');
      return { commits: [], error: 'An error occurred while extracting commits' };
    } finally {
      setIsLoading(false);
    }
  };

  // This function will be passed to the CommitPreviewList component
  const handleCommitsSelected = async (selectedCommits: CommitInfo[]) => {
    await onCommitsSelectedAction(selectedCommits);
  };

  const handleBackToDateSelection = () => {
    setShowCommits(false);
    setError(null);
  };

  return (
    <div className="space-y-6 w-full">
      {!showCommits ? (
        <CommitExtractionForm
          repositoryPath={repositoryPath}
          contributors={contributors}
          onExtractAction={handleExtractCommits}
          onBack={onBack}
          isLoading={isLoading}
          error={error}
        />
      ) : (
        <CommitPreviewList 
          commits={commits}
          onCommitsSelected={handleCommitsSelected}
          onBack={handleBackToDateSelection}
        />
      )}
    </div>
  );
}
