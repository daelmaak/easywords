import { VocabularyItem } from '~/domains/vocabularies/model/vocabulary-model';

export function mergeWords(
  arr1: VocabularyItem[] = [],
  arr2: VocabularyItem[] = []
) {
  const merged = new Map<number, VocabularyItem>();

  for (const item of arr1.concat(arr2)) {
    merged.set(item.id, item);
  }

  return Array.from(merged.values());
}
