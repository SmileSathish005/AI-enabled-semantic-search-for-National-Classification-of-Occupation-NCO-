export interface NCOOccupation {
  code: string;
  title: string;
  description: string;
  division: string;
  divisionTitle: string;
  group: string;
  groupTitle: string;
  subGroup: string;
  subGroupTitle: string;
  sector: string;
  keywords: string[];
  skillLevel: number;
  tasks: string[];
}

export interface SearchResult {
  occupation: NCOOccupation;
  confidence: number;
  relevanceScore: number;
  matchedFields: string[];
  matchedKeywords: string[];
}

export interface SearchFilters {
  division?: string;
  skillLevel?: number;
  sector?: string;
  minConfidence?: number;
}

export interface SearchAuditLog {
  id: string;
  timestamp: Date;
  query: string;
  filters: SearchFilters;
  resultsCount: number;
  selectedCode?: string;
  userId?: string;
  sessionId: string;
  searchTime: number;
  language: string;
  inputMethod: 'text' | 'voice';
}

export interface AdminUser {
  id: string;
  username: string;
  role: 'admin' | 'editor' | 'viewer';
  lastLogin: Date;
}

export interface OccupationUpdate {
  id: string;
  occupationCode: string;
  field: keyof NCOOccupation;
  oldValue: any;
  newValue: any;
  updatedBy: string;
  timestamp: Date;
  approved: boolean;
}

export interface VoiceSearchState {
  isListening: boolean;
  isSupported: boolean;
  transcript: string;
  confidence: number;
  language: string;
}

export interface ErrorState {
  type: 'network' | 'search' | 'voice' | 'data' | 'auth';
  message: string;
  suggestions: string[];
  timestamp: Date;
}