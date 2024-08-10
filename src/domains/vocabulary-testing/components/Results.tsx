import { A } from '@solidjs/router';
import { createSignal, For, Show } from 'solid-js';
import { Button } from '~/components/ui/button';
import { WordEditorDialog } from '~/domains/vocabularies/components/WordEditorDialog';
import type { VocabularyItem } from '~/domains/vocabularies/model/vocabulary-model';
import { ResultWord } from './ResultWord';
import type { TestResult } from '~/domains/vocabulary-results/model/test-result-model';
import { TestResultsVisualisation } from '~/domains/vocabulary-results/components/TestResultsVisualisation';

interface ResultsProps {
  results: TestResult;
  words: VocabularyItem[];
  editWord: (word: VocabularyItem) => void;
  onRepeatAll: () => void;
  onRepeatInvalid: (invalidWords: VocabularyItem[]) => void;
}

export function Results(props: ResultsProps) {
  const [wordToEdit, setWordToEdit] = createSignal<VocabularyItem>();

  const invalidWords = () =>
    props.results.words
      .filter(word => word.invalidAttempts > 0)
      .map(word => props.words.find(w => w.id === word.id)!);

  function onWordEdited(word: VocabularyItem) {
    props.editWord(word);
    setWordToEdit(undefined);
  }

  return (
    <div class="mx-auto flex flex-col">
      <WordEditorDialog
        word={wordToEdit()}
        open={wordToEdit() != null}
        onClose={() => setWordToEdit(undefined)}
        onWordEdited={onWordEdited}
      />

      <div class="mx-auto max-w-96 min-w-80">
        <TestResultsVisualisation result={props.results} />
      </div>

      <Show when={invalidWords()}>
        {invalidWords => (
          <section class="mx-auto mt-10 flex flex-col">
            <h2 class="mb-4 text-lg text-center">
              Words you guessed incorrectly
            </h2>

            <ul
              class="mx-auto max-h-64 overflow-y-auto"
              data-testid="results-invalid-words"
            >
              <For each={invalidWords()}>
                {word => (
                  <li>
                    <ResultWord
                      word={word}
                      onEditWord={() => setWordToEdit(word)}
                    />
                  </li>
                )}
              </For>
            </ul>

            <div class="mx-auto mt-2"></div>
          </section>
        )}
      </Show>

      <div class="mx-auto mt-8 flex items-center gap-4 sm:mt-16">
        <Show when={invalidWords()}>
          {invalidWords => (
            <Button
              class="btn-link"
              type="button"
              onClick={() => props.onRepeatInvalid(invalidWords())}
            >
              Practice incorrect
            </Button>
          )}
        </Show>
        <Button type="button" variant="secondary" onClick={props.onRepeatAll}>
          Test all again
        </Button>
        <A class="text-primary text-sm" href="..">
          Back to Vocabulary
        </A>
      </div>
    </div>
  );
}
