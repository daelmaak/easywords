import { Show, createEffect, createSignal } from 'solid-js';
import { createStore } from 'solid-js/store';
import { WordTranslation } from '../../parser/simple-md-parser';
import { Results } from './Results';
import {
  VocabularySettings,
  VocabularyUserSettings,
} from './VocabularySettings';
import { VocabularyTester } from './VocabularyTester';
import { WordsInput } from './WordsInput';
import { fetchVocabulary } from './resources/vocabulary-resources';

export const VocabularyView = () => {
  const [vocabularySettings, setVocabularySettings] =
    createStore<VocabularyUserSettings>({
      mode: 'write',
      reverseTranslations: false,
      repeatInvalid: false,
    });
  const [words, setWords] = createSignal<WordTranslation[]>();
  const [invalidWords, setInvalidWords] = createSignal<WordTranslation[]>();
  const [removedWords, setRemovedWords] = createSignal<WordTranslation[]>();
  const [done, setDone] = createSignal(false);

  const [vocabularyLists] = fetchVocabulary;

  createEffect(() => {
    console.log(vocabularyLists());
    return vocabularyLists();
  });

  async function onDone(
    leftOverWords?: WordTranslation[],
    removedWords?: WordTranslation[]
  ) {
    setDone(true);
    setInvalidWords(leftOverWords);
    setRemovedWords(removedWords);
  }

  function onRepeat() {
    setInvalidWords();
    setDone(false);
  }

  function onReset() {
    setInvalidWords();
    setWords();
    setDone(false);
  }

  function onTryInvalidWords(invalidWords: WordTranslation[]) {
    setInvalidWords();
    setWords(invalidWords);
    setDone(false);
  }

  async function selectWords(words: WordTranslation[]) {
    setInvalidWords();
    setWords(words);
  }

  return (
    <div class="h-full grid grid-rows-[auto_4rem_1rem]">
      <div class="m-auto">
        <Show when={!words() && !done()}>
          <div class="w-[min(80vw,_25rem)]">
            <WordsInput
              onWordsSelect={selectWords}
              reverse={vocabularySettings.reverseTranslations}
            />
          </div>
        </Show>

        <Show when={!done()}>
          <Show keyed={true} when={words()}>
            {w => (
              <VocabularyTester
                mode={vocabularySettings.mode}
                repeatInvalid={vocabularySettings.repeatInvalid}
                reverse={vocabularySettings.reverseTranslations}
                words={w}
                done={onDone}
                repeat={onRepeat}
                reset={onReset}
              />
            )}
          </Show>
        </Show>

        <Show when={done()}>
          <Results
            invalidWords={invalidWords()}
            removedWords={removedWords()}
            words={words()}
            repeat={onRepeat}
            reset={onReset}
            tryInvalidWords={onTryInvalidWords}
          />
        </Show>
      </div>

      <VocabularySettings
        settings={vocabularySettings}
        onChange={setVocabularySettings}
      />

      <Show when={words()}>
        <button
          class="btn-link fixed bottom-4 right-8 text-sm"
          onClick={onReset}
        >
          Go back
        </button>
      </Show>
    </div>
  );
};
