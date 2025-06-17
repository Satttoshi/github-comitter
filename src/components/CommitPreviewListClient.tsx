'use client';

import React, { useState } from 'react';
import { format } from 'date-fns';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { CommitInfo } from '@/app/actions/repository';

interface CommitPreviewListClientProps {
  commits: CommitInfo[];
  commitsSelectedAction: (commits: CommitInfo[]) => Promise<void>;
  onBackAction: () => void;
}

export function CommitPreviewListClient({
  commits,
  commitsSelectedAction,
  onBackAction
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
      await commitsSelectedAction(selectedCommits);
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

  const regularCommitsCount = commits.filter(c => !c.isSquashed).length;
  const squashedCommitsCount = commits.filter(c => c.isSquashed).length;

  // Group commits by their original squash hash for better visualization
  const groupedCommits = currentCommits.reduce((groups, commit) => {
    if (commit.isSquashMerge) {
      // This is a squash merge commit, create a new group for it
      const key = commit.hash;
      if (!groups[key]) {
        groups[key] = [];
      }
      // Add the merge commit itself as the first item
      groups[key].push(commit);
    } else if (commit.isSquashed && commit.originalSquashHash) {
      // This is a subcommit, add it to the existing group
      const key = commit.originalSquashHash;
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(commit);
    } else {
      // Regular commits go into a special "regular" group
      if (!groups['regular']) {
        groups['regular'] = [];
      }
      groups['regular'].push(commit);
    }
    return groups;
  }, {} as Record<string, CommitInfo[]>);

  return (
    <div className="space-y-6 w-full">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Select Commits to Import</h3>
          <div className="text-sm text-gray-600 mt-1">
            {commits.length} total commits ({regularCommitsCount} regular, {squashedCommitsCount} from squashed merges)
          </div>
        </div>
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
                    Type
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
                {Object.entries(groupedCommits).map(([groupKey, groupCommits]) => (
                  <React.Fragment key={groupKey}>

                    {/* Individual commits in the group */}
                    {groupCommits.map((commit) => (
                      <tr key={commit.hash} className={`hover:bg-gray-50 ${commit.isSquashed ? 'bg-blue-50' : ''}`}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Checkbox
                            checked={selectedCommits.some(c => c.hash === commit.hash)}
                            onCheckedChange={() => toggleCommit(commit)}
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {commit.isSquashMerge ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              Merge
                            </span>
                          ) : commit.isSquashed ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Squashed
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              Regular
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(commit.date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {commit.author}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                          <div className="group relative">
                            <div className="truncate pr-4" title={commit.message}>
                              {commit.isSquashed && (
                                <span className="text-blue-600 mr-1">└─</span>
                              )}
                              {commit.message}
                            </div>
                            {commit.message.length > 60 && (
                              <div className="absolute left-0 top-full mt-1 p-2 bg-gray-900 text-white text-xs rounded shadow-lg z-10 max-w-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                {commit.message}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
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
        <Button variant="outline" onClick={onBackAction}>
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
