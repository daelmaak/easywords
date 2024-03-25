import { useNavigate, useParams } from '@solidjs/router';
import { Show, createEffect, createSignal } from 'solid-js';
import { createStore } from 'solid-js/store';
import { WordTranslation } from '~/model/word-translation';
import {
  getVocabulary,
  updateVocabularyItems,
} from '../vocabularies/resources/vocabulary-resources';
import { VocabularyItem } from '../vocabularies/vocabulary-model';
import { Results } from './components/Results';
import {
  VocabularySettings,
  VocabularyUserSettings,
} from './components/VocabularySettings';
import { VocabularyTester } from './components/VocabularyTester';

export const VocabularyTestPage = () => {
  const navigate = useNavigate();
  const params = useParams();
  const listId = +params.id;
  const vocabulary = () => getVocabulary(listId);

  const [vocabularySettings, setVocabularySettings] =
    createStore<VocabularyUserSettings>({
      mode: 'write',
      reverseTranslations: false,
      repeatInvalid: false,
    });
  const [words, setWords] = createSignal<VocabularyItem[]>();
  const [invalidWords, setInvalidWords] = createSignal<WordTranslation[]>();
  const [removedWords, setRemovedWords] = createSignal<WordTranslation[]>();
  const [done, setDone] = createSignal(false);

  createEffect(() => {
    const vocab = vocabulary();

    if (vocab) {
      setWords(vocab.vocabularyItems);
    }
    return vocab;
  });

  async function onDone(
    leftOverWords?: WordTranslation[],
    removedWords?: WordTranslation[]
  ) {
    setDone(true);
    setInvalidWords(leftOverWords);
    setRemovedWords(removedWords);
  }

  function onEditWord(word: VocabularyItem) {
    updateVocabularyItems(listId, word);
  }

  function onGoBack() {
    navigate('/vocabulary');
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

  function onTryInvalidWords(invalidWords: VocabularyItem[]) {
    setInvalidWords();
    setWords(invalidWords);
    setDone(false);
  }

  return (
    <>
      <Show when={!done()}>
        <Show when={words()}>
          {w => (
            <>
              <div class="m-auto">
                <VocabularyTester
                  mode={vocabularySettings.mode}
                  repeatInvalid={vocabularySettings.repeatInvalid}
                  reverse={vocabularySettings.reverseTranslations}
                  words={w()}
                  done={onDone}
                  editWord={onEditWord}
                  repeat={onRepeat}
                  reset={onReset}
                />
              </div>
              <div class="mt-auto">
                <VocabularySettings
                  settings={vocabularySettings}
                  onChange={setVocabularySettings}
                />
              </div>
            </>
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

      <Show when={words()}>
        <button
          class="btn-link fixed bottom-4 right-8 text-sm"
          onClick={onGoBack}
        >
          Go back
        </button>
      </Show>
    </>
  );
};
