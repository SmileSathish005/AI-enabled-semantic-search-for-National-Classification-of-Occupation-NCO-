import React from 'react';
import { Globe, ChevronDown } from 'lucide-react';
import { supportedLanguages } from '../utils/translation';

interface LanguageSelectorProps {
  currentLanguage: string;
  onLanguageChange: (language: string) => void;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  currentLanguage,
  onLanguageChange
}) => {
  const currentLang = supportedLanguages.find(lang => lang.code === currentLanguage);

  return (
    <div className="relative group">
      <button className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors">
        <Globe className="h-4 w-4" />
        <span>{currentLang?.nativeName || 'English'}</span>
        <ChevronDown className="h-3 w-3" />
      </button>
      
      <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 min-w-48">
        <div className="py-2">
          {supportedLanguages.map((language) => (
            <button
              key={language.code}
              onClick={() => onLanguageChange(language.code)}
              className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors ${
                currentLanguage === language.code
                  ? 'bg-blue-50 text-blue-600 font-medium'
                  : 'text-gray-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span>{language.nativeName}</span>
                <span className="text-xs text-gray-500">{language.name}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};