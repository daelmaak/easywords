import { CountryCode } from '~/components/country-select/countries';

export interface VocabularyItem {
  id: number;
  list_id: number;
  original: string;
  translation: string;
}

// TODO: rename
export interface VocabularyList {
  id: number;
  country: CountryCode;
  name: string;
  vocabularyItems: VocabularyItem[];
}
