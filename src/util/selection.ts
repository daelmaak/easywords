import { unionBy, differenceBy } from 'lodash-es';
import { createSignal } from 'solid-js';
import type { Word } from '~/domains/vocabularies/model/vocabulary-model';

export function wordsSelector() {
  const [lastSelectedWordIndex, setLastSelectedWordIndex] = createSignal(-1);

  function selectWords(
    selectedWord: Word,
    selected: boolean,
    sortedWords: Word[],
    prevSelectedWords: Word[],
    meta?: { shiftSelection: boolean }
  ) {
    const wordIndex = sortedWords.findIndex(w => w.id === selectedWord.id);
    let selectedWords: Word[] = [selectedWord];

    if (meta?.shiftSelection) {
      const startIndex = Math.min(lastSelectedWordIndex(), wordIndex);
      const endIndex = Math.max(lastSelectedWordIndex(), wordIndex);
      selectedWords = sortedWords.slice(startIndex, endIndex + 1);
    }

    setLastSelectedWordIndex(wordIndex);

    if (selected) {
      return unionBy(prevSelectedWords, selectedWords, 'id');
    } else {
      return differenceBy(prevSelectedWords, selectedWords, 'id');
    }
  }

  return selectWords;
}
