import React, { useState, useEffect, useRef } from 'react';
import { Search, Filter, X, ChevronDown, Lightbulb, AlertCircle } from 'lucide-react';
import { SearchFilters } from '../types/nco';
import { divisions, sectors } from '../data/ncoData';
import { searchEngine } from '../utils/searchEngine';
import { VoiceSearch } from './VoiceSearch';
import { ErrorState } from '../types/nco';

interface SearchInterfaceProps {
  query: string;
  setQuery: (query: string) => void;
  filters: SearchFilters;
  setFilters: (filters: SearchFilters) => void;
  onSearch: () => void;
  isLoading: boolean;
  error?: ErrorState;
  language: string;
}

export const SearchInterface: React.FC<SearchInterfaceProps> = ({
  query,
  setQuery,
  filters,
  setFilters,
  onSearch,
  isLoading,
  error,
  language
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.length > 2) {
        const newSuggestions = searchEngine.getSuggestions(query);
        setSuggestions(newSuggestions);
        setShowSuggestions(newSuggestions.length > 0);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuggestions(false);
    onSearch();
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    setTimeout(onSearch, 100);
  };

  const handleVoiceResult = (transcript: string) => {
    setQuery(transcript);
    setShowSuggestions(false);
    setTimeout(onSearch, 100);
  };

  const clearFilters = () => {
    setFilters({});
  };

  const hasActiveFilters = Object.keys(filters).some(key => 
    filters[key as keyof SearchFilters] !== undefined && filters[key as keyof SearchFilters] !== ''
  );

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Search Input */}
        <div className="relative">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              ref={searchInputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter job title, description, or keywords (e.g., 'sewing machine operator', 'software developer')"
              className="w-full pl-12 pr-20 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-lg"
              disabled={isLoading}
            />
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
              <VoiceSearch
                onResult={handleVoiceResult}
                language={language}
                disabled={isLoading}
              />
            </div>
          </div>
          
          {/* Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div
              ref={suggestionsRef}
              className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
            >
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  className="w-full px-4 py-3 text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none border-b border-gray-100 last:border-b-0 flex items-center gap-2"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  <Lightbulb className="h-4 w-4 text-blue-500" />
                  <span className="text-gray-900">{suggestion}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-red-900 mb-1">{error.message}</h4>
                {error.suggestions.length > 0 && (
                  <div>
                    <p className="text-sm text-red-700 mb-2">Try these suggestions:</p>
                    <ul className="text-sm text-red-700 space-y-1">
                      {error.suggestions.map((suggestion, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <span className="w-1 h-1 bg-red-400 rounded-full"></span>
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Filter Toggle and Search Button */}
        <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
              showFilters || hasActiveFilters
                ? 'bg-blue-50 border-blue-300 text-blue-700'
                : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Filter className="h-4 w-4" />
            <span>Filters</span>
            {hasActiveFilters && (
              <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                {Object.keys(filters).filter(key => filters[key as keyof SearchFilters]).length}
              </span>
            )}
            <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>

          <button
            type="submit"
            disabled={!query.trim() || isLoading}
            className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-8 py-2 rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
          >
            {isLoading ? 'Searching...' : 'Search Occupations'}
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="border-t border-gray-200 pt-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Search Filters</h3>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <X className="h-4 w-4" />
                  Clear all
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Division Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Division
                </label>
                <select
                  value={filters.division || ''}
                  onChange={(e) => setFilters({ ...filters, division: e.target.value || undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Divisions</option>
                  {divisions.map((div) => (
                    <option key={div.code} value={div.code}>
                      {div.code} - {div.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Skill Level Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Skill Level
                </label>
                <select
                  value={filters.skillLevel || ''}
                  onChange={(e) => setFilters({ ...filters, skillLevel: e.target.value ? parseInt(e.target.value) : undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Skill Levels</option>
                  <option value="1">Level 1 - Elementary</option>
                  <option value="2">Level 2 - Semi-skilled</option>
                  <option value="3">Level 3 - Skilled</option>
                  <option value="4">Level 4 - Highly skilled</option>
                </select>
              </div>

              {/* Sector Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sector
                </label>
                <select
                  value={filters.sector || ''}
                  onChange={(e) => setFilters({ ...filters, sector: e.target.value || undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Sectors</option>
                  {sectors.map((sector) => (
                    <option key={sector} value={sector}>
                      {sector}
                    </option>
                  ))}
                </select>
              </div>

              {/* Confidence Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Min. Confidence
                </label>
                <select
                  value={filters.minConfidence || ''}
                  onChange={(e) => setFilters({ ...filters, minConfidence: e.target.value ? parseFloat(e.target.value) : undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Any Confidence</option>
                  <option value="0.1">10% or higher</option>
                  <option value="0.3">30% or higher</option>
                  <option value="0.5">50% or higher</option>
                  <option value="0.7">70% or higher</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};