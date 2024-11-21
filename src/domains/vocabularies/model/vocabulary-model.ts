import type { CountryCode } from '~/components/country-select/countries';
import type { TestResultWord } from '~/domains/vocabulary-results/model/test-result-model';

export interface Word {
  id: number;
  archived: boolean;
  createdAt: Date;
  vocabularyId: number;
  original: string;
  translation: string;
  notes: string | undefined;
  results?: TestResultWord[];
  lastTestDate?: Date;
  testCount?: number;
  averageTestScore?: number;
}

export interface Vocabulary {
  id: number;
  country: CountryCode;
  name: string;
  updatedAt?: Date;
  words: Word[];
}
