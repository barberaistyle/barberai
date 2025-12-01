export enum AppStep {
  UPLOAD = 'UPLOAD',
  SELECT_STYLE = 'SELECT_STYLE',
  PROCESSING = 'PROCESSING',
  RESULT = 'RESULT',
}

export interface HairstyleOption {
  id: string;
  name: string;
  description: string;
  gender: 'male' | 'female' | 'unisex';
  previewColor: string;
}

export interface GeneratedImage {
  original: string; // Base64
  result: string; // Base64
  styleApplied: string;
}
