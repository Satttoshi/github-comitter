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

  // This function will be passed to the CommitExtractionForm component
  const handleExtractCommits = async (
    repoPath: string,
    contribs: Contributor[],
    fromDate: string,
    toDate: string
  ) => {
    const result = await extractCommitsAction(
      repoPath,
      contribs,
      fromDate,
      toDate
    );

    if (!result.error && result.commits.length > 0) {
      setCommits(result.commits);
      setShowCommits(true);
    }

    return result;
  };

  // This function will be passed to the CommitPreviewList component
  const handleCommitsSelected = async (selectedCommits: CommitInfo[]) => {
    await onCommitsSelectedAction(selectedCommits);
  };

  const handleBackToDateSelection = () => {
    setShowCommits(false);
  };

  return (
    <div className="space-y-6 w-full">
      {!showCommits ? (
        <CommitExtractionForm
          repositoryPath={repositoryPath}
          contributors={contributors}
          onExtractAction={handleExtractCommits}
          onBack={onBack}
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
