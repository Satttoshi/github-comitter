'use client';

import { useState } from 'react';
import { DateRange } from 'react-day-picker';
import { subMonths } from 'date-fns';
import { DateRangePicker } from '@/components/DateRangePicker';
import { Button } from '@/components/ui/button';
import { Contributor, CommitInfo } from '@/app/actions/repository';

interface CommitExtractionFormProps {
  repositoryPath: string;
  contributors: Contributor[];
  onExtractAction: (repositoryPath: string, contributors: Contributor[], fromDate: string, toDate: string) => Promise<{ commits: CommitInfo[]; error?: string }>;
  onBack: () => void;
}

export function CommitExtractionForm({ 
  repositoryPath, 
  contributors, 
  onExtractAction, 
  onBack 
}: CommitExtractionFormProps) {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subMonths(new Date(), 1),
    to: new Date(),
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleExtractCommits = async () => {
    if (!dateRange?.from || !dateRange?.to) {
      setError('Please select a date range');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Format dates for Git (ISO format)
      const fromDate = dateRange.from.toISOString();
      const toDate = dateRange.to.toISOString();

      console.log('Extracting commits with:', { fromDate, toDate, repositoryPath, contributors });

      const result = await onExtractAction(
        repositoryPath,
        contributors,
        fromDate,
        toDate
      );

      if (result.error) {
        setError(result.error);
      } else if (result.commits.length === 0) {
        setError('No commits found in the selected date range for the selected contributors.');
      } else {
        // If successful, the parent component will handle the result
        return result;
      }
    } catch (err) {
      setError('An error occurred while extracting commits');
      console.error('Error in handleExtractCommits:', err);
    } finally {
      setIsLoading(false);
    }
    
    return { commits: [], error: error || undefined };
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Step 3: Select Date Range</h3>
      <p className="text-sm text-gray-500">
        First, select a date range to extract commits from the selected contributors. Then click the &quot;Extract Commits&quot; button below.
      </p>

      <DateRangePicker 
        dateRange={dateRange} 
        onDateRangeChange={setDateRange} 
      />

      {error && (
        <div className="bg-red-50 p-4 rounded-md text-red-500">
          {error}
        </div>
      )}

      <div className="bg-blue-50 p-4 rounded-md border border-blue-200 mt-6">
        <h4 className="font-medium text-blue-700 mb-2">What to do next:</h4>
        <ol className="list-decimal pl-5 text-sm text-blue-700 space-y-1">
          <li>Select a date range by clicking on the date selector above</li>
          <li>Click the &quot;Extract Commits&quot; button to find commits in that date range</li>
          <li>You&apos;ll then be able to select which commits to import</li>
        </ol>
      </div>

      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onBack} className="px-6">
          Back
        </Button>
        <Button 
          onClick={handleExtractCommits}
          disabled={isLoading || !dateRange?.from || !dateRange?.to}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 text-base font-medium"
        >
          {isLoading ? 'Extracting...' : 'Extract Commits'}
        </Button>
      </div>
    </div>
  );
}