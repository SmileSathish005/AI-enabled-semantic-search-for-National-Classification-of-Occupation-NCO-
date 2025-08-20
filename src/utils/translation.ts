export interface TranslationStrings {
  [key: string]: string;
}

export interface LanguageConfig {
  code: string;
  name: string;
  nativeName: string;
  voiceCode: string;
  rtl: boolean;
}

export const supportedLanguages: LanguageConfig[] = [
  { code: 'en', name: 'English', nativeName: 'English', voiceCode: 'en-US', rtl: false },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', voiceCode: 'hi-IN', rtl: false },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', voiceCode: 'bn-IN', rtl: false },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', voiceCode: 'te-IN', rtl: false },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', voiceCode: 'mr-IN', rtl: false },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', voiceCode: 'ta-IN', rtl: false },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', voiceCode: 'gu-IN', rtl: false },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', voiceCode: 'kn-IN', rtl: false },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', voiceCode: 'ml-IN', rtl: false },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', voiceCode: 'pa-IN', rtl: false }
];

const translations: Record<string, TranslationStrings> = {
  en: {
    'search.placeholder': 'Enter job title, description, or keywords',
    'search.button': 'Search Occupations',
    'search.voice': 'Voice Search',
    'search.filters': 'Filters',
    'search.results': 'Search Results',
    'search.noResults': 'No matching occupations found',
    'search.error': 'Search error occurred',
    'occupation.code': 'Occupation Code',
    'occupation.title': 'Title',
    'occupation.description': 'Description',
    'occupation.division': 'Division',
    'occupation.skillLevel': 'Skill Level',
    'occupation.sector': 'Sector',
    'occupation.tasks': 'Main Tasks',
    'occupation.keywords': 'Keywords',
    'admin.title': 'Admin Panel',
    'admin.users': 'Users',
    'admin.audit': 'Audit Logs',
    'admin.occupations': 'Occupations',
    'voice.listening': 'Listening...',
    'voice.notSupported': 'Voice search not supported',
    'voice.permissionDenied': 'Microphone permission denied'
  },
  hi: {
    'search.placeholder': 'नौकरी का शीर्षक, विवरण या कीवर्ड दर्ज करें',
    'search.button': 'व्यवसाय खोजें',
    'search.voice': 'आवाज खोज',
    'search.filters': 'फिल्टर',
    'search.results': 'खोज परिणाम',
    'search.noResults': 'कोई मेल खाने वाले व्यवसाय नहीं मिले',
    'search.error': 'खोज त्रुटि हुई',
    'occupation.code': 'व्यवसाय कोड',
    'occupation.title': 'शीर्षक',
    'occupation.description': 'विवरण',
    'occupation.division': 'विभाग',
    'occupation.skillLevel': 'कौशल स्तर',
    'occupation.sector': 'क्षेत्र',
    'occupation.tasks': 'मुख्य कार्य',
    'occupation.keywords': 'कीवर्ड',
    'admin.title': 'प्रशासन पैनल',
    'admin.users': 'उपयोगकर्ता',
    'admin.audit': 'ऑडिट लॉग',
    'admin.occupations': 'व्यवसाय',
    'voice.listening': 'सुन रहा है...',
    'voice.notSupported': 'आवाज खोज समर्थित नहीं',
    'voice.permissionDenied': 'माइक्रोफोन अनुमति अस्वीकृत'
  }
};

export class TranslationManager {
  private currentLanguage: string = 'en';
  
  setLanguage(languageCode: string): void {
    if (translations[languageCode]) {
      this.currentLanguage = languageCode;
      
      // Update document direction for RTL languages
      const language = supportedLanguages.find(lang => lang.code === languageCode);
      if (language && typeof document !== 'undefined') {
        document.dir = language.rtl ? 'rtl' : 'ltr';
        document.documentElement.lang = languageCode;
      }
    }
  }
  
  getCurrentLanguage(): string {
    return this.currentLanguage;
  }
  
  translate(key: string): string {
    const languageStrings = translations[this.currentLanguage];
    return languageStrings?.[key] || translations.en[key] || key;
  }
  
  translateOccupation(occupation: any, language: string): any {
    // In a real implementation, this would translate occupation data
    // For now, return the original data
    return occupation;
  }
}

export const translationManager = new TranslationManager();