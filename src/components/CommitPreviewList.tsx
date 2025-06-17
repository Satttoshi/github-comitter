import { CommitInfo } from '@/app/actions/repository';
import { CommitPreviewListClient } from '@/components/CommitPreviewListClient';

interface CommitPreviewListProps {
  commits: CommitInfo[];
  onCommitsSelected: (commits: CommitInfo[]) => Promise<void>;
  onBack: () => void;
}

export function CommitPreviewList({
  commits,
  onCommitsSelected,
  onBack
}: CommitPreviewListProps) {
  return (
    <CommitPreviewListClient
      commits={commits}
      commitsSelectedAction={onCommitsSelected}
      onBackAction={onBack}
    />
  );
}
