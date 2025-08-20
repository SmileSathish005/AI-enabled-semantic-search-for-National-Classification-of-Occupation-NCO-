import React from 'react';
import { Search, Database, Award, Settings } from 'lucide-react';
import { LanguageSelector } from './LanguageSelector';

interface HeaderProps {
  currentLanguage: string;
  onLanguageChange: (language: string) => void;
  onAdminClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  currentLanguage, 
  onLanguageChange, 
  onAdminClick 
}) => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Database className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                NCO Semantic Search
              </h1>
              <p className="text-sm text-gray-600">
                National Classification of Occupations 2015
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Search className="h-4 w-4" />
              <span>AI-Powered Search</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Award className="h-4 w-4" />
              <span>3,600+ Occupations</span>
            </div>
            <LanguageSelector
              currentLanguage={currentLanguage}
              onLanguageChange={onLanguageChange}
            />
            <button
              onClick={onAdminClick}
              className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              <Settings className="h-4 w-4" />
              <span>Admin</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};