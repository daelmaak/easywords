import { VocabularyItem } from '../vocabularies/model/vocabulary-model';

export interface SavedProgress {
  invalidWords: VocabularyItem[];
  leftOverWords: VocabularyItem[];
}
