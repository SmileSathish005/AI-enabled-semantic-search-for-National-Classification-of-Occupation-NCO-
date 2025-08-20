import React, { useState } from 'react';
import { SearchResult } from '../types/nco';
import { ChevronDown, ChevronUp, Copy, Check, BookOpen, Award, Building2, Tag } from 'lucide-react';

interface SearchResultsProps {
  results: SearchResult[];
  query: string;
  isLoading: boolean;
}

export const SearchResults: React.FC<SearchResultsProps> = ({ results, query, isLoading }) => {
  const [expandedResults, setExpandedResults] = useState<Set<string>>(new Set());
  const [copiedCodes, setCopiedCodes] = useState<Set<string>>(new Set());

  const toggleExpanded = (code: string) => {
    const newExpanded = new Set(expandedResults);
    if (newExpanded.has(code)) {
      newExpanded.delete(code);
    } else {
      newExpanded.add(code);
    }
    setExpandedResults(newExpanded);
  };

  const copyToClipboard = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCodes(prev => new Set(prev).add(code));
      setTimeout(() => {
        setCopiedCodes(prev => {
          const newSet = new Set(prev);
          newSet.delete(code);
          return newSet;
        });
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.7) return 'text-green-600 bg-green-100';
    if (confidence >= 0.4) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getSkillLevelLabel = (level: number) => {
    const labels = {
      1: 'Elementary',
      2: 'Semi-skilled',
      3: 'Skilled',
      4: 'Highly skilled'
    };
    return labels[level as keyof typeof labels] || 'Unknown';
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
        <div className="flex items-center justify-center space-x-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="text-gray-600">Searching NCO database...</span>
        </div>
      </div>
    );
  }

  if (results.length === 0 && query) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 text-center">
        <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No matching occupations found</h3>
        <p className="text-gray-600 mb-4">
          Try adjusting your search query or removing some filters. Consider using broader terms or synonyms.
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
          <h4 className="font-medium text-blue-900 mb-2">Search Tips:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Use job titles or descriptions instead of exact keywords</li>
            <li>• Try broader terms (e.g., "developer" instead of "senior software engineer")</li>
            <li>• Remove filters to see more results</li>
            <li>• Use synonyms for your occupation</li>
          </ul>
        </div>
      </div>
    );
  }

  if (!query) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 text-center">
        <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Search NCO Database</h3>
        <p className="text-gray-600">
          Enter a job title, description, or keywords to find matching occupation codes from the National Classification of Occupations (NCO-2015).
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Search Results for "{query}"
          </h2>
          <span className="text-sm text-gray-500">
            {results.length} occupation{results.length !== 1 ? 's' : ''} found
          </span>
        </div>

        <div className="space-y-4">
          {results.map((result, index) => {
            const isExpanded = expandedResults.has(result.occupation.code);
            const isCopied = copiedCodes.has(result.occupation.code);

            return (
              <div
                key={result.occupation.code}
                className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                        #{index + 1}
                      </span>
                      <button
                        onClick={() => copyToClipboard(result.occupation.code)}
                        className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-lg text-sm font-mono transition-colors"
                      >
                        {isCopied ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4 text-gray-600" />
                        )}
                        {result.occupation.code}
                      </button>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getConfidenceColor(result.confidence)}`}>
                        {Math.round(result.confidence * 100)}% match
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {result.occupation.title}
                    </h3>
                    <p className="text-gray-600 mb-3 line-clamp-2">
                      {result.occupation.description}
                    </p>
                  </div>
                </div>

                {/* Metadata */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      Division {result.occupation.division}: {result.occupation.divisionTitle}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      Skill Level {result.occupation.skillLevel}: {getSkillLevelLabel(result.occupation.skillLevel)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      {result.occupation.sector}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      Group {result.occupation.group}
                    </span>
                  </div>
                </div>

                {/* Matched Fields */}
                {result.matchedFields.length > 0 && (
                  <div className="mb-4">
                    <span className="text-sm font-medium text-gray-700 mr-2">Matched in:</span>
                    <div className="inline-flex flex-wrap gap-1">
                      {result.matchedFields.map((field) => (
                        <span
                          key={field}
                          className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded"
                        >
                          {field}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Expand/Collapse Button */}
                <button
                  onClick={() => toggleExpanded(result.occupation.code)}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
                >
                  {isExpanded ? (
                    <>
                      <ChevronUp className="h-4 w-4" />
                      Show less details
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4" />
                      Show more details
                    </>
                  )}
                </button>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                    {/* Hierarchy */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Classification Hierarchy</h4>
                      <div className="bg-gray-50 rounded-lg p-3 space-y-2 text-sm">
                        <div><strong>Division:</strong> {result.occupation.division} - {result.occupation.divisionTitle}</div>
                        <div><strong>Group:</strong> {result.occupation.group} - {result.occupation.groupTitle}</div>
                        <div><strong>Sub-group:</strong> {result.occupation.subGroup} - {result.occupation.subGroupTitle}</div>
                        <div><strong>Occupation Code:</strong> {result.occupation.code}</div>
                      </div>
                    </div>

                    {/* Main Tasks */}
                    {result.occupation.tasks.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Main Tasks and Duties</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                          {result.occupation.tasks.map((task, idx) => (
                            <li key={idx}>{task}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Keywords */}
                    {result.occupation.keywords.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Related Keywords</h4>
                        <div className="flex flex-wrap gap-2">
                          {result.occupation.keywords.map((keyword) => (
                            <span
                              key={keyword}
                              className={`px-2 py-1 rounded text-xs ${
                                result.matchedKeywords.includes(keyword)
                                  ? 'bg-yellow-100 text-yellow-800 font-medium'
                                  : 'bg-gray-100 text-gray-600'
                              }`}
                            >
                              {keyword}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Technical Details */}
                    <div className="bg-blue-50 rounded-lg p-3">
                      <h4 className="font-medium text-blue-900 mb-2">Search Analysis</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm text-blue-800">
                        <div>
                          <strong>Relevance Score:</strong> {result.relevanceScore.toFixed(3)}
                        </div>
                        <div>
                          <strong>Confidence:</strong> {(result.confidence * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};