'use client';

import { useState } from 'react';
import { RepositoryPathInput } from '@/components/RepositoryPathInput';
import { ContributorSelector } from '@/components/ContributorSelector';
import { CommitExtraction } from '@/components/CommitExtraction';
import { CommitImport } from '@/components/CommitImport';
import { Contributor, CommitInfo, selectCommitsAction } from '@/app/actions/repository';

enum ImportStep {
  RepositorySelection = 0,
  ContributorScanning = 1,
  CommitExtraction = 2,
  CommitImport = 3,
}

export function RepositoryImportClient() {
  const [currentStep, setCurrentStep] = useState<ImportStep>(ImportStep.RepositorySelection);
  const [repositoryPath, setRepositoryPath] = useState<string | null>(null);
  const [selectedContributors, setSelectedContributors] = useState<Contributor[]>([]);
  const [selectedCommits, setSelectedCommits] = useState<CommitInfo[]>([]);

  const handleValidRepository = (path: string) => {
    setRepositoryPath(path);
    setCurrentStep(ImportStep.ContributorScanning);
  };

  // Server action wrapper for handling commit selection
  const commitsSelectedAction = async (commits: CommitInfo[]) => {
    // Call the server action to handle the selected commits
    const result = await selectCommitsAction();

    if (result.success) {
      setSelectedCommits(commits);
      setCurrentStep(ImportStep.CommitImport);
    } else {
      console.error('Error selecting commits:', result.error);
    }
  };

  return (
    <div>
      {/* Step indicator */}
      <div className="mb-8">
        <ol className="flex items-center w-full">
          {['Repository Selection', 'Contributor Scanning', 'Commit Extraction', 'Commit Import'].map((step, index) => (
            <li key={index} className={`flex items-center ${index < currentStep ? 'text-blue-600' : index === currentStep ? 'text-blue-500' : 'text-gray-500'}`}>
              <span className={`flex items-center justify-center w-8 h-8 rounded-full ${index < currentStep ? 'bg-blue-100 text-blue-600' : index === currentStep ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-500'} mr-2`}>
                {index + 1}
              </span>
              {step}
              {index < 3 && <div className={`flex-1 h-px mx-4 ${index < currentStep ? 'bg-blue-600' : 'bg-gray-200'}`}></div>}
            </li>
          ))}
        </ol>
      </div>

      {/* Step content */}
      <div className="mt-6">
        {currentStep === ImportStep.RepositorySelection && (
          <RepositoryPathInput onValidRepository={handleValidRepository} />
        )}

        {currentStep === ImportStep.ContributorScanning && repositoryPath && (
          <ContributorSelector
            repositoryPath={repositoryPath}
            onContributorsSelected={(contributors) => {
              setSelectedContributors(contributors);
              setCurrentStep(ImportStep.CommitExtraction);
            }}
            onBack={() => setCurrentStep(ImportStep.RepositorySelection)}
          />
        )}

        {currentStep === ImportStep.CommitExtraction && repositoryPath && (
          <CommitExtraction
            repositoryPath={repositoryPath}
            contributors={selectedContributors}
            onCommitsSelectedAction={commitsSelectedAction}
            onBack={() => setCurrentStep(ImportStep.ContributorScanning)}
          />
        )}

        {currentStep === ImportStep.CommitImport && (
          <CommitImport
            commits={selectedCommits}
            onBack={() => setCurrentStep(ImportStep.CommitExtraction)}
            onComplete={() => {
              // Reset the form after successful import
              setCurrentStep(ImportStep.RepositorySelection);
              setRepositoryPath(null);
              setSelectedContributors([]);
              setSelectedCommits([]);
            }}
          />
        )}
      </div>
    </div>
  );
}
