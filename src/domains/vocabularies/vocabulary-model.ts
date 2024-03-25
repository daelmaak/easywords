export interface VocabularyItem {
  id: number;
  list_id: number;
  original: string;
  translation: string;
}

export interface VocabularyList {
  id: number;
  name: string;
  vocabularyItems: VocabularyItem[];
}
