import { unionBy, differenceBy } from 'lodash-es';
import type { Word } from '~/domains/vocabularies/model/vocabulary-model';
import { wordsSelector } from '~/util/selection';

export function categorySelection(
  allWords: Word[],
  onSelectionChange: (selectedWords: Word[]) => void
) {
  const selectWords = wordsSelector();

  function isWordSelected(word: Word, selectedWords: Word[]) {
    return selectedWords.find(sw => word.id === sw.id) != null;
  }

  function getCategorySelectionStatus(words: Word[], selectedWords: Word[]) {
    if (selectWords.length === 0) {
      return;
    }

    const fully = words.every(word =>
      selectedWords.find(sw => word.id === sw.id)
    );

    return fully
      ? 'full'
      : words.some(word => selectedWords.find(sw => word.id === sw.id))
        ? 'partial'
        : undefined;
  }

  function onWordSelected(
    word: Word,
    selectedWords: Word[],
    selected: boolean
  ) {
    const newSelectedWords = selectWords(
      word,
      selected,
      allWords,
      selectedWords
    );
    onSelectionChange(newSelectedWords);
  }

  function onCategorySelected(
    words: Word[],
    selectedWords: Word[],
    selected: boolean
  ) {
    if (selected) {
      onSelectionChange(unionBy(selectedWords, words, 'id'));
    } else {
      onSelectionChange(differenceBy(selectedWords, words, 'id'));
    }
  }

  return {
    getCategorySelectionStatus,
    isWordSelected,
    onWordSelected,
    onCategorySelected,
  };
}
