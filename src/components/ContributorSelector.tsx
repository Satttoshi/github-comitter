import { ContributorSelectorForm } from '@/components/ContributorSelectorForm';
import { Contributor, scanContributors } from '@/app/actions/repository';

interface ContributorSelectorProps {
  repositoryPath: string;
  onContributorsSelected: (contributors: Contributor[]) => void;
  onBack: () => void;
}

export function ContributorSelector({ 
  repositoryPath, 
  onContributorsSelected, 
  onBack 
}: ContributorSelectorProps) {
  // This function will be passed to the ContributorSelectorForm component
  const handleScanAction = async (repoPath: string) => {
    return await scanContributors(repoPath);
  };

  return (
    <ContributorSelectorForm
      repositoryPath={repositoryPath}
      onScanAction={handleScanAction}
      onContributorsSelected={onContributorsSelected}
      onBack={onBack}
    />
  );
}
