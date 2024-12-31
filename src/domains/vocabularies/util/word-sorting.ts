import type { SortState } from '../components/VocabularyWords';
import type { Word } from '../model/vocabulary-model';

export function toSortedWords(words: Word[], { by, asc }: SortState): Word[] {
  return words.slice().toSorted((a, b) => {
    const aValue = a[by];
    const bValue = b[by];

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      const aNum = parseInt(aValue);
      const bNum = parseInt(bValue);

      if (!isNaN(aNum) && !isNaN(bNum)) {
        return asc ? aNum - bNum : bNum - aNum;
      } else {
        return asc
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
    }

    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return asc ? aValue - bValue : bValue - aValue;
    }

    if (typeof aValue === 'boolean' && typeof bValue === 'boolean') {
      return asc ? (aValue ? 1 : -1) : bValue ? 1 : -1;
    }

    if (aValue instanceof Date && bValue instanceof Date) {
      return asc
        ? aValue.getTime() - bValue.getTime()
        : bValue.getTime() - aValue.getTime();
    }

    // if only one value is defined, prefer the defined one
    if ((aValue == null || bValue == null) && aValue != bValue) {
      return asc ? (aValue ? 1 : -1) : aValue ? -1 : 1;
    }

    return 0;
  });
}
