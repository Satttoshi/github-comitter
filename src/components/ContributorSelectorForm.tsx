'use client';

import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Contributor } from '@/app/actions/repository';

interface ContributorSelectorFormProps {
  repositoryPath: string;
  onScanAction: (repositoryPath: string) => Promise<{ contributors: Contributor[]; error?: string }>;
  onContributorsSelected: (contributors: Contributor[]) => void;
  onBack: () => void;
}

export function ContributorSelectorForm({ 
  repositoryPath, 
  onScanAction,
  onContributorsSelected, 
  onBack 
}: ContributorSelectorFormProps) {
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [selectedContributors, setSelectedContributors] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadContributors() {
      setIsLoading(true);
      setError(null);
      
      try {
        const result = await onScanAction(repositoryPath);
        
        if (result.error) {
          setError(result.error);
        } else {
          setContributors(result.contributors);
        }
      } catch (err) {
        setError('An error occurred while scanning contributors');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadContributors();
  }, [repositoryPath, onScanAction]);

  const toggleContributor = (contributor: Contributor) => {
    const key = `${contributor.name}<${contributor.email}>`;
    const newSelected = new Set(selectedContributors);
    
    if (newSelected.has(key)) {
      newSelected.delete(key);
    } else {
      newSelected.add(key);
    }
    
    setSelectedContributors(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedContributors.size === contributors.length) {
      // Deselect all
      setSelectedContributors(new Set());
    } else {
      // Select all
      const allKeys = contributors.map(c => `${c.name}<${c.email}>`);
      setSelectedContributors(new Set(allKeys));
    }
  };

  const handleContinue = () => {
    const selected = contributors.filter(contributor => {
      const key = `${contributor.name}<${contributor.email}>`;
      return selectedContributors.has(key);
    });
    
    onContributorsSelected(selected);
  };

  return (
    <div className="space-y-6 w-full">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Select Contributors</h3>
        <div className="space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleSelectAll}
            disabled={isLoading || contributors.length === 0}
          >
            {selectedContributors.size === contributors.length ? 'Deselect All' : 'Select All'}
          </Button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <span className="ml-2">Scanning contributors...</span>
        </div>
      ) : error ? (
        <div className="bg-red-50 p-4 rounded-md text-red-500">
          {error}
        </div>
      ) : contributors.length === 0 ? (
        <div className="bg-yellow-50 p-4 rounded-md text-yellow-700">
          No contributors found in this repository.
        </div>
      ) : (
        <div className="border rounded-md divide-y">
          {contributors.map((contributor, index) => (
            <div 
              key={index} 
              className="flex items-center justify-between p-4 hover:bg-gray-50"
            >
              <div className="flex items-center space-x-3">
                <Checkbox 
                  id={`contributor-${index}`}
                  checked={selectedContributors.has(`${contributor.name}<${contributor.email}>`)}
                  onCheckedChange={() => toggleContributor(contributor)}
                />
                <div>
                  <Label 
                    htmlFor={`contributor-${index}`}
                    className="font-medium cursor-pointer"
                  >
                    {contributor.name}
                  </Label>
                  <p className="text-sm text-gray-500">{contributor.email}</p>
                </div>
              </div>
              <div className="text-sm text-gray-500">
                {contributor.commitCount} {contributor.commitCount === 1 ? 'commit' : 'commits'}
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button 
          onClick={handleContinue}
          disabled={isLoading || selectedContributors.size === 0}
        >
          Continue
        </Button>
      </div>
    </div>
  );
}