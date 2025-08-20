import React from 'react';
import { SearchResult } from '../types/nco';
import { BarChart, TrendingUp, Target, Clock } from 'lucide-react';

interface StatsPanelProps {
  results: SearchResult[];
  query: string;
  searchTime?: number;
}

export const StatsPanel: React.FC<StatsPanelProps> = ({ results, query, searchTime }) => {
  if (!results.length || !query) {
    return null;
  }

  const avgConfidence = results.reduce((sum, result) => sum + result.confidence, 0) / results.length;
  const highConfidenceResults = results.filter(result => result.confidence >= 0.7).length;
  const topDivisions = results
    .reduce((acc, result) => {
      const division = result.occupation.divisionTitle;
      acc[division] = (acc[division] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  const topDivision = Object.entries(topDivisions)
    .sort(([, a], [, b]) => b - a)[0];

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-8">
      <div className="flex items-center gap-2 mb-4">
        <BarChart className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">Search Analytics</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="text-center">
          <div className="bg-blue-50 rounded-full p-3 w-12 h-12 flex items-center justify-center mx-auto mb-2">
            <Target className="h-6 w-6 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {(avgConfidence * 100).toFixed(1)}%
          </div>
          <div className="text-sm text-gray-600">Avg. Confidence</div>
        </div>

        <div className="text-center">
          <div className="bg-green-50 rounded-full p-3 w-12 h-12 flex items-center justify-center mx-auto mb-2">
            <TrendingUp className="h-6 w-6 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {highConfidenceResults}
          </div>
          <div className="text-sm text-gray-600">High Confidence</div>
        </div>

        <div className="text-center">
          <div className="bg-purple-50 rounded-full p-3 w-12 h-12 flex items-center justify-center mx-auto mb-2">
            <BarChart className="h-6 w-6 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {results.length}
          </div>
          <div className="text-sm text-gray-600">Total Matches</div>
        </div>

        <div className="text-center">
          <div className="bg-orange-50 rounded-full p-3 w-12 h-12 flex items-center justify-center mx-auto mb-2">
            <Clock className="h-6 w-6 text-orange-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {searchTime ? `${searchTime}ms` : '<1ms'}
          </div>
          <div className="text-sm text-gray-600">Search Time</div>
        </div>
      </div>

      {topDivision && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-blue-900">Most Relevant Division</h4>
              <p className="text-sm text-blue-700">{topDivision[0]}</p>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold text-blue-900">{topDivision[1]}</div>
              <div className="text-xs text-blue-700">matches</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};