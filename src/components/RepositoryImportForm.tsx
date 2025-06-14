import { RepositoryImportClient } from '@/components/RepositoryImportClient';

export function RepositoryImportForm() {
  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Import Repository Commits</h2>
      <RepositoryImportClient />
    </div>
  );
}
