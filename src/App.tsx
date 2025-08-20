import React, { useState, useCallback } from 'react';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Header } from './components/Header';
import { SearchInterface } from './components/SearchInterface';
import { SearchResults } from './components/SearchResults';
import { StatsPanel } from './components/StatsPanel';
import { AdminPanel } from './components/AdminPanel';
import { SearchResult, SearchFilters, ErrorState } from './types/nco';
import { searchEngine } from './utils/searchEngine';
import { translationManager, supportedLanguages } from './utils/translation';

function App() {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({});
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTime, setSearchTime] = useState<number | null>(null);
  const [error, setError] = useState<ErrorState | undefined>();
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  const handleSearch = useCallback(async () => {
    if (!query.trim()) {
      setResults([]);
      setError(undefined);
      return;
    }

    setIsLoading(true);
    setError(undefined);
    const startTime = performance.now();

    // Simulate slight delay for more realistic feel
    await new Promise(resolve => setTimeout(resolve, 100));

    try {
      const { results: searchResults, error: searchError } = searchEngine.searchWithErrorHandling(
        query, 
        filters, 
        10, 
        currentLanguage,
        'text'
      );
      setResults(searchResults);
      setError(searchError);
      const endTime = performance.now();
      setSearchTime(Math.round(endTime - startTime));
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
      setError({
        type: 'search',
        message: 'An unexpected error occurred',
        suggestions: ['Please try again', 'Check your internet connection'],
        timestamp: new Date()
      });
    } finally {
      setIsLoading(false);
    }
  }, [query, filters, currentLanguage]);

  const handleLanguageChange = (language: string) => {
    setCurrentLanguage(language);
    translationManager.setLanguage(language);
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        <Header 
          currentLanguage={currentLanguage}
          onLanguageChange={handleLanguageChange}
          onAdminClick={() => setShowAdminPanel(true)}
        />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Find Your Occupation Code
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl">
              Use our AI-powered semantic search to quickly find the most relevant occupation codes 
              from NCO-2015. Simply describe the job in natural language and get ranked results 
              with confidence scores.
            </p>
          </div>

          <SearchInterface
            query={query}
            setQuery={setQuery}
            filters={filters}
            setFilters={setFilters}
            onSearch={handleSearch}
            isLoading={isLoading}
            error={error}
            language={supportedLanguages.find(lang => lang.code === currentLanguage)?.voiceCode || 'en-US'}
          />

          <StatsPanel 
            results={results} 
            query={query} 
            searchTime={searchTime} 
          />

          <SearchResults
            results={results}
            query={query}
            isLoading={isLoading}
          />
        </main>

        <AdminPanel
          isOpen={showAdminPanel}
          onClose={() => setShowAdminPanel(false)}
        />

        <footer className="bg-white border-t border-gray-200 mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">About NCO</h3>
                <p className="text-gray-600 text-sm">
                  The National Classification of Occupations (NCO) is India's standardized 
                  system for classifying occupations, aligned with international standards 
                  and covering over 3,600 civilian occupations.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">How It Works</h3>
                <p className="text-gray-600 text-sm">
                  Our AI-powered semantic search analyzes job descriptions and matches them 
                  against the complete NCO database using advanced text similarity algorithms 
                  and confidence scoring.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Source</h3>
                <p className="text-gray-600 text-sm">
                  Based on the National Classification of Occupations 2015 (NCO-2015) 
                  published by the Ministry of Labour and Employment, Government of India.
                </p>
              </div>
            </div>
            <div className="border-t border-gray-200 mt-8 pt-8 text-center">
              <p className="text-gray-500 text-sm">
                © 2025 NCO Semantic Search. Built for efficient occupation classification.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </ErrorBoundary>
  );
}

export default App;