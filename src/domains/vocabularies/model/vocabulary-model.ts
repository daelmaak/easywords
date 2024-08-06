import type { CountryCode } from '~/components/country-select/countries';
import type { TestResult } from '~/domains/vocabulary-results/model/test-result-model';

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
  updatedAt: Date;
  vocabularyItems: VocabularyItem[];
  savedProgress?: TestResult;
}
