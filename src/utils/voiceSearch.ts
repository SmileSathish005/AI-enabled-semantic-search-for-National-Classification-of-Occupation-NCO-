import { VoiceSearchState } from '../types/nco';

export class VoiceSearchManager {
  private recognition: SpeechRecognition | null = null;
  private isSupported: boolean = false;
  private currentLanguage: string = 'en-US';
  
  constructor() {
    this.initializeSpeechRecognition();
  }

  private initializeSpeechRecognition(): void {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.isSupported = true;
        
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.maxAlternatives = 1;
        this.recognition.lang = this.currentLanguage;
      }
    }
  }

  isVoiceSupported(): boolean {
    return this.isSupported;
  }

  setLanguage(language: string): void {
    this.currentLanguage = language;
    if (this.recognition) {
      this.recognition.lang = language;
    }
  }

  startListening(
    onResult: (transcript: string, confidence: number) => void,
    onError: (error: string) => void,
    onStateChange: (state: VoiceSearchState) => void
  ): void {
    if (!this.recognition) {
      onError('Voice recognition not supported in this browser');
      return;
    }

    onStateChange({
      isListening: true,
      isSupported: true,
      transcript: '',
      confidence: 0,
      language: this.currentLanguage
    });

    this.recognition.onresult = (event) => {
      let transcript = '';
      let confidence = 0;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        transcript += result[0].transcript;
        confidence = result[0].confidence;
      }

      onResult(transcript, confidence);
      onStateChange({
        isListening: true,
        isSupported: true,
        transcript,
        confidence,
        language: this.currentLanguage
      });
    };

    this.recognition.onerror = (event) => {
      let errorMessage = 'Voice recognition error';
      
      switch (event.error) {
        case 'no-speech':
          errorMessage = 'No speech detected. Please try again.';
          break;
        case 'audio-capture':
          errorMessage = 'Microphone not accessible. Please check permissions.';
          break;
        case 'not-allowed':
          errorMessage = 'Microphone access denied. Please enable microphone permissions.';
          break;
        case 'network':
          errorMessage = 'Network error. Please check your connection.';
          break;
        default:
          errorMessage = `Voice recognition error: ${event.error}`;
      }
      
      onError(errorMessage);
      onStateChange({
        isListening: false,
        isSupported: true,
        transcript: '',
        confidence: 0,
        language: this.currentLanguage
      });
    };

    this.recognition.onend = () => {
      onStateChange({
        isListening: false,
        isSupported: true,
        transcript: '',
        confidence: 0,
        language: this.currentLanguage
      });
    };

    try {
      this.recognition.start();
    } catch (error) {
      onError('Failed to start voice recognition');
      onStateChange({
        isListening: false,
        isSupported: true,
        transcript: '',
        confidence: 0,
        language: this.currentLanguage
      });
    }
  }

  stopListening(): void {
    if (this.recognition) {
      this.recognition.stop();
    }
  }
}

export const voiceSearchManager = new VoiceSearchManager();