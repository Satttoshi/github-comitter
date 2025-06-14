'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CommitInfo } from '@/app/actions/repository';
import { importCommitsAction } from '@/app/actions/import';

interface CommitImportProps {
  commits: CommitInfo[];
  onBack: () => void;
  onComplete: () => void;
}

export function CommitImport({ commits, onBack, onComplete }: CommitImportProps) {
  const [isImporting, setIsImporting] = useState(false);
  const [result, setResult] = useState<{ success?: boolean; importedCount?: number; error?: string } | null>(null);

  const handleImport = async () => {
    setIsImporting(true);
    setResult(null);

    try {
      const importResult = await importCommitsAction(commits);
      setResult(importResult);

      if (importResult.success && importResult.importedCount > 0) {
        // Wait a moment before completing to allow the user to see the success message
        setTimeout(onComplete, 3000);
      }
    } catch (error) {
      console.error('Error importing commits:', error);
      setResult({ 
        success: false, 
        error: error instanceof Error ? error.message : 'An unknown error occurred' 
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Step 4: Import Commits</h3>

      <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
        <p className="text-sm text-blue-700">
          You&apos;ve selected {commits.length} commits to import. Click the &quot;Import Commits&quot; button below to create these commits in your current repository.
        </p>
      </div>

      {result && (
        <div className={`p-4 rounded-md ${result.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {result.success ? (
            <p>Successfully imported {result.importedCount} commits!</p>
          ) : (
            <p>Error: {result.error}</p>
          )}
        </div>
      )}

      <div className="space-y-2">
        <h4 className="font-medium">Selected Commits:</h4>
        <div className="border rounded-md divide-y max-h-60 overflow-y-auto">
          {commits.map((commit, index) => (
            <div key={index} className="p-3 text-sm">
              <div className="font-medium">{commit.message}</div>
              <div className="text-gray-500">
                {new Date(commit.date).toLocaleString()} by {commit.author}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <Button 
          variant="outline" 
          onClick={onBack}
          disabled={isImporting}
        >
          Back
        </Button>
        <Button 
          onClick={handleImport}
          disabled={isImporting || commits.length === 0}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          {isImporting ? 'Importing...' : 'Import Commits'}
        </Button>
      </div>
    </div>
  );
}
