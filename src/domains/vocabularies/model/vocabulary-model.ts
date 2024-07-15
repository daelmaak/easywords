import type { CountryCode } from '~/components/country-select/countries';

export interface VocabularyItem {
  id: number;
  createdAt: Date;
  vocabularyId: number;
  original: string;
  translation: string;
  notes: string | undefined;
}

export interface Vocabulary {
  id: number;
  country: CountryCode;
  name: string;
  vocabularyItems: VocabularyItem[];
  hasSavedProgress: boolean;
}
