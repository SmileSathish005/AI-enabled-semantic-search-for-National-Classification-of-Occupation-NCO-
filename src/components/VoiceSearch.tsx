import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, AlertCircle } from 'lucide-react';
import { VoiceSearchState } from '../types/nco';
import { voiceSearchManager } from '../utils/voiceSearch';
import { translationManager } from '../utils/translation';

interface VoiceSearchProps {
  onResult: (transcript: string) => void;
  language: string;
  disabled?: boolean;
}

export const VoiceSearch: React.FC<VoiceSearchProps> = ({ onResult, language, disabled = false }) => {
  const [voiceState, setVoiceState] = useState<VoiceSearchState>({
    isListening: false,
    isSupported: voiceSearchManager.isVoiceSupported(),
    transcript: '',
    confidence: 0,
    language
  });
  const [error, setError] = useState<string>('');

  useEffect(() => {
    voiceSearchManager.setLanguage(language);
  }, [language]);

  const startListening = () => {
    if (!voiceState.isSupported) {
      setError(translationManager.translate('voice.notSupported'));
      return;
    }

    setError('');
    voiceSearchManager.startListening(
      (transcript, confidence) => {
        if (transcript.trim()) {
          onResult(transcript);
        }
      },
      (errorMessage) => {
        setError(errorMessage);
      },
      (state) => {
        setVoiceState(state);
      }
    );
  };

  const stopListening = () => {
    voiceSearchManager.stopListening();
    setVoiceState(prev => ({ ...prev, isListening: false }));
  };

  if (!voiceState.isSupported) {
    return (
      <div className="flex items-center gap-2 text-gray-400">
        <MicOff className="h-5 w-5" />
        <span className="text-sm">{translationManager.translate('voice.notSupported')}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={voiceState.isListening ? stopListening : startListening}
        disabled={disabled}
        className={`p-2 rounded-lg border transition-all duration-200 ${
          voiceState.isListening
            ? 'bg-red-50 border-red-300 text-red-600 animate-pulse'
            : 'bg-blue-50 border-blue-300 text-blue-600 hover:bg-blue-100'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        title={voiceState.isListening ? 'Stop listening' : 'Start voice search'}
      >
        {voiceState.isListening ? (
          <MicOff className="h-5 w-5" />
        ) : (
          <Mic className="h-5 w-5" />
        )}
      </button>

      {voiceState.isListening && (
        <div className="flex items-center gap-2 text-sm text-blue-600">
          <Volume2 className="h-4 w-4 animate-pulse" />
          <span>{translationManager.translate('voice.listening')}</span>
          {voiceState.confidence > 0 && (
            <span className="text-xs bg-blue-100 px-2 py-1 rounded">
              {Math.round(voiceState.confidence * 100)}%
            </span>
          )}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}

      {voiceState.transcript && !voiceState.isListening && (
        <div className="text-sm text-green-600 bg-green-50 px-2 py-1 rounded">
          Recognized: "{voiceState.transcript}"
        </div>
      )}
    </div>
  );
};