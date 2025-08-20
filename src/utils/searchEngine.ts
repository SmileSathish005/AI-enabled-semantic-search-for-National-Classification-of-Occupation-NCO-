import { NCOOccupation, SearchResult, SearchFilters } from '../types/nco';
import { ncoOccupations } from '../data/ncoData';
import { SearchAuditLog, ErrorState } from '../types/nco';

export class SemanticSearchEngine {
  private occupations: NCOOccupation[];
  private stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'been', 'being', 'have', 'has', 'had']);
  private auditLogs: SearchAuditLog[] = [];
  private sessionId: string;

  constructor(occupations: NCOOccupation[]) {
    this.occupations = occupations;
    this.sessionId = this.generateSessionId();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(token => token.length > 2 && !this.stopWords.has(token));
  }

  private calculateJaccardSimilarity(set1: Set<string>, set2: Set<string>): number {
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    return union.size === 0 ? 0 : intersection.size / union.size;
  }

  private calculateTFIDF(queryTokens: string[], documentTokens: string[]): number {
    const querySet = new Set(queryTokens);
    const docSet = new Set(documentTokens);
    
    let score = 0;
    for (const term of querySet) {
      const tf = documentTokens.filter(t => t === term).length / documentTokens.length;
      const df = this.occupations.filter(occ => 
        this.tokenize(`${occ.title} ${occ.description} ${occ.keywords.join(' ')}`).includes(term)
      ).length;
      const idf = Math.log(this.occupations.length / (df + 1));
      score += tf * idf;
    }
    
    return score;
  }

  private calculateSemanticScore(query: string, occupation: NCOOccupation): {
    score: number;
    matchedFields: string[];
    matchedKeywords: string[];
  } {
    const queryTokens = this.tokenize(query);
    const querySet = new Set(queryTokens);
    
    const titleTokens = this.tokenize(occupation.title);
    const descTokens = this.tokenize(occupation.description);
    const keywordTokens = occupation.keywords.map(k => k.toLowerCase());
    const taskTokens = this.tokenize(occupation.tasks.join(' '));
    
    const titleSet = new Set(titleTokens);
    const descSet = new Set(descTokens);
    const keywordSet = new Set(keywordTokens);
    const taskSet = new Set(taskTokens);
    
    // Calculate different similarity scores with weights
    const titleSim = this.calculateJaccardSimilarity(querySet, titleSet) * 3.0;
    const keywordSim = this.calculateJaccardSimilarity(querySet, keywordSet) * 2.5;
    const descSim = this.calculateJaccardSimilarity(querySet, descSet) * 1.5;
    const taskSim = this.calculateJaccardSimilarity(querySet, taskSet) * 1.0;
    
    // TF-IDF score
    const allDocTokens = [...titleTokens, ...descTokens, ...keywordTokens, ...taskTokens];
    const tfidfScore = this.calculateTFIDF(queryTokens, allDocTokens) * 2.0;
    
    // Exact matches bonus
    const exactTitleMatch = occupation.title.toLowerCase().includes(query.toLowerCase()) ? 2.0 : 0;
    const exactKeywordMatch = keywordTokens.some(k => k.includes(query.toLowerCase())) ? 1.5 : 0;
    
    const totalScore = titleSim + keywordSim + descSim + taskSim + tfidfScore + exactTitleMatch + exactKeywordMatch;
    
    // Determine matched fields
    const matchedFields: string[] = [];
    const matchedKeywords: string[] = [];
    
    if (titleSim > 0 || exactTitleMatch > 0) matchedFields.push('title');
    if (keywordSim > 0 || exactKeywordMatch > 0) matchedFields.push('keywords');
    if (descSim > 0) matchedFields.push('description');
    if (taskSim > 0) matchedFields.push('tasks');
    
    // Find specific matched keywords
    queryTokens.forEach(token => {
      if (keywordTokens.some(k => k.includes(token))) {
        matchedKeywords.push(...keywordTokens.filter(k => k.includes(token)));
      }
    });
    
    return {
      score: totalScore,
      matchedFields,
      matchedKeywords: [...new Set(matchedKeywords)]
    };
  }

  search(query: string, filters: SearchFilters = {}, topN: number = 10): SearchResult[] {
    if (!query.trim()) {
      return [];
    }

    let filteredOccupations = this.occupations;
    
    // Apply filters
    if (filters.division) {
      filteredOccupations = filteredOccupations.filter(occ => occ.division === filters.division);
    }
    if (filters.skillLevel) {
      filteredOccupations = filteredOccupations.filter(occ => occ.skillLevel === filters.skillLevel);
    }
    if (filters.sector) {
      filteredOccupations = filteredOccupations.filter(occ => occ.sector === filters.sector);
    }

    const results: SearchResult[] = filteredOccupations.map(occupation => {
      const { score, matchedFields, matchedKeywords } = this.calculateSemanticScore(query, occupation);
      
      // Calculate confidence based on score normalization
      const maxPossibleScore = 15; // Theoretical maximum based on our scoring system
      const confidence = Math.min(score / maxPossibleScore, 1.0);
      
      return {
        occupation,
        confidence,
        relevanceScore: score,
        matchedFields,
        matchedKeywords
      };
    });

    // Sort by relevance score and apply filters
    let sortedResults = results
      .filter(result => result.relevanceScore > 0)
      .sort((a, b) => b.relevanceScore - a.relevanceScore);

    if (filters.minConfidence) {
      sortedResults = sortedResults.filter(result => result.confidence >= filters.minConfidence);
    }

    return sortedResults.slice(0, topN);
  }

  getSuggestions(query: string): string[] {
    const suggestions = new Set<string>();
    const queryLower = query.toLowerCase();
    
    this.occupations.forEach(occ => {
      // Add title suggestions
      if (occ.title.toLowerCase().includes(queryLower)) {
        suggestions.add(occ.title);
      }
      
      // Add keyword suggestions
      occ.keywords.forEach(keyword => {
        if (keyword.toLowerCase().includes(queryLower)) {
          suggestions.add(keyword);
        }
      });
    });
    
    return Array.from(suggestions).slice(0, 5);
  }

  private logSearch(query: string, filters: SearchFilters, resultsCount: number, searchTime: number, language: string = 'en', inputMethod: 'text' | 'voice' = 'text'): void {
    const log: SearchAuditLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      query,
      filters,
      resultsCount,
      userId: 'anonymous', // In real app, get from auth context
      sessionId: this.sessionId,
      searchTime,
      language,
      inputMethod
    };
    
    this.auditLogs.push(log);
    
    // In production, send to backend
    if (typeof window !== 'undefined') {
      localStorage.setItem('nco_audit_logs', JSON.stringify(this.auditLogs.slice(-100))); // Keep last 100 logs
    }
  }

  searchWithErrorHandling(query: string, filters: SearchFilters = {}, topN: number = 10, language: string = 'en', inputMethod: 'text' | 'voice' = 'text'): { results: SearchResult[]; error?: ErrorState } {
    const startTime = performance.now();
    
    try {
      if (!query.trim()) {
        return {
          results: [],
          error: {
            type: 'search',
            message: 'Please enter a search query',
            suggestions: ['Try searching for job titles like "teacher", "doctor", or "engineer"'],
            timestamp: new Date()
          }
        };
      }

      const results = this.search(query, filters, topN);
      const searchTime = performance.now() - startTime;
      
      this.logSearch(query, filters, results.length, searchTime, language, inputMethod);
      
      if (results.length === 0) {
        const suggestions = this.generateFallbackSuggestions(query);
        return {
          results: [],
          error: {
            type: 'search',
            message: 'No matching occupations found',
            suggestions,
            timestamp: new Date()
          }
        };
      }
      
      return { results };
    } catch (error) {
      console.error('Search error:', error);
      return {
        results: [],
        error: {
          type: 'search',
          message: 'An error occurred while searching. Please try again.',
          suggestions: ['Check your internet connection', 'Try a simpler search query', 'Refresh the page'],
          timestamp: new Date()
        }
      };
    }
  }

  private generateFallbackSuggestions(query: string): string[] {
    const queryLower = query.toLowerCase();
    const suggestions: string[] = [];
    
    // Find similar occupations
    const similarOccupations = this.occupations
      .filter(occ => 
        occ.title.toLowerCase().includes(queryLower.substring(0, 3)) ||
        occ.keywords.some(k => k.toLowerCase().includes(queryLower.substring(0, 3)))
      )
      .slice(0, 3)
      .map(occ => `Try "${occ.title}"`);
    
    suggestions.push(...similarOccupations);
    
    // Add generic suggestions
    if (suggestions.length < 3) {
      suggestions.push(
        'Use broader terms (e.g., "teacher" instead of "mathematics teacher")',
        'Try synonyms or alternative job titles',
        'Remove filters to see more results'
      );
    }
    
    return suggestions.slice(0, 5);
  }

  getAuditLogs(): SearchAuditLog[] {
    return [...this.auditLogs];
  }

  exportAuditLogs(): string {
    return JSON.stringify(this.auditLogs, null, 2);
  }
}

export const searchEngine = new SemanticSearchEngine(ncoOccupations);