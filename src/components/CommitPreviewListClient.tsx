'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { CommitInfo } from '@/app/actions/repository';

interface CommitPreviewListClientProps {
  commits: CommitInfo[];
  onCommitsSelectedAction: (commits: CommitInfo[]) => Promise<void>;
  onBack: () => void;
}

export function CommitPreviewListClient({ 
  commits, 
  onCommitsSelectedAction, 
  onBack 
}: CommitPreviewListClientProps) {
  const [selectedCommits, setSelectedCommits] = useState<CommitInfo[]>(commits);
  const [currentPage, setCurrentPage] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const commitsPerPage = 10;
  
  // Calculate pagination
  const totalPages = Math.ceil(commits.length / commitsPerPage);
  const indexOfLastCommit = currentPage * commitsPerPage;
  const indexOfFirstCommit = indexOfLastCommit - commitsPerPage;
  const currentCommits = commits.slice(indexOfFirstCommit, indexOfLastCommit);
  
  const toggleCommit = (commit: CommitInfo) => {
    setSelectedCommits(prev => {
      const isSelected = prev.some(c => c.hash === commit.hash);
      
      if (isSelected) {
        return prev.filter(c => c.hash !== commit.hash);
      } else {
        return [...prev, commit];
      }
    });
  };
  
  const handleSelectAll = () => {
    if (selectedCommits.length === commits.length) {
      setSelectedCommits([]);
    } else {
      setSelectedCommits([...commits]);
    }
  };
  
  const handleContinue = async () => {
    setIsSubmitting(true);
    try {
      await onCommitsSelectedAction(selectedCommits);
    } catch (error) {
      console.error('Error selecting commits:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
    } catch (e) {
      return dateString;
    }
  };
  
  return (
    <div className="space-y-6 w-full">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Select Commits to Import</h3>
        <div className="space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleSelectAll}
          >
            {selectedCommits.length === commits.length ? 'Deselect All' : 'Select All'}
          </Button>
        </div>
      </div>
      
      {commits.length === 0 ? (
        <div className="bg-yellow-50 p-4 rounded-md text-yellow-700">
          No commits found in the selected date range for the selected contributors.
        </div>
      ) : (
        <>
          <div className="border rounded-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Select
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Author
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Message
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentCommits.map((commit) => (
                  <tr key={commit.hash} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Checkbox 
                        checked={selectedCommits.some(c => c.hash === commit.hash)}
                        onCheckedChange={() => toggleCommit(commit)}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(commit.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {commit.author}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 truncate max-w-md">
                      {commit.message}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center space-x-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="px-4 py-2 text-sm">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
      
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button 
          onClick={handleContinue}
          disabled={selectedCommits.length === 0 || isSubmitting}
        >
          {isSubmitting ? 'Processing...' : 'Continue'}
        </Button>
      </div>
    </div>
  );
}