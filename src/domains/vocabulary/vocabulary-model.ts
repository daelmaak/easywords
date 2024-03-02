export interface VocabularyItem {
  id: number;
  original: string;
  translation: string;
}

export interface VocabularyList {
  id: number;
  name: string;
  vocabulary_items: VocabularyItem[];
}
