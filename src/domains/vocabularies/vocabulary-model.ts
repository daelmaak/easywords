import { CountryCode } from '~/components/country-select/countries';

export interface VocabularyItem {
  id: number;
  list_id: number;
  original: string;
  translation: string;
}

export interface Vocabulary {
  id: number;
  country: CountryCode;
  name: string;
  vocabularyItems: VocabularyItem[];
}
