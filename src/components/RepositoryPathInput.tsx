'use client';

import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { validateRepository } from '@/app/actions/repository';

interface RepositoryPathInputProps {
  onValidRepository: (path: string) => void;
}

export function RepositoryPathInput({ onValidRepository }: RepositoryPathInputProps) {
  const [path, setPath] = useState<string>('');
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleValidate = async () => {
    if (!path.trim()) {
      setError('Repository path cannot be empty');
      return;
    }

    setIsValidating(true);
    setError(null);

    try {
      const result = await validateRepository(path);
      
      if (result.valid) {
        onValidRepository(path);
      } else {
        setError(result.error || 'Invalid repository path');
      }
    } catch (err) {
      setError('An error occurred while validating the repository');
      console.error(err);
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="space-y-4 w-full">
      <div className="space-y-2">
        <Label htmlFor="repository-path">Local Git Repository Path</Label>
        <div className="flex space-x-2">
          <Input
            id="repository-path"
            placeholder="Enter path to local Git repository"
            value={path}
            onChange={(e) => setPath(e.target.value)}
            className="flex-1"
          />
          <Button 
            onClick={handleValidate} 
            disabled={isValidating}
          >
            {isValidating ? 'Validating...' : 'Validate'}
          </Button>
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <p className="text-sm text-gray-500">
          Enter the absolute path to a local Git repository. Example: C:\Users\username\projects\my-repo or /Users/username/projects/my-repo
        </p>
      </div>
    </div>
  );
}