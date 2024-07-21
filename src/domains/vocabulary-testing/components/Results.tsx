import { A } from '@solidjs/router';
import { createSignal, For, Show } from 'solid-js';
import { Button } from '~/components/ui/button';
import { WordEditorDialog } from '~/domains/vocabularies/components/WordEditorDialog';
import type { VocabularyItem } from '~/domains/vocabularies/model/vocabulary-model';
import { ResultWord } from './ResultWord';
import { Progress, ProgressValueLabel } from '~/components/ui/progress';

interface ResultsProps {
  invalidWords?: VocabularyItem[];
  words: VocabularyItem[];
  editWord: (word: VocabularyItem) => void;
  repeat: () => void;
  goToVocabularies: () => void;
  tryInvalidWords: (invalidWords: VocabularyItem[]) => void;
}

export function Results(props: ResultsProps) {
  const [wordToEdit, setWordToEdit] = createSignal<VocabularyItem>();

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

      <h1 class="text-center text-2xl">Test finished!</h1>

      <Progress
        class="mt-12 mx-auto w-full sm:w-96"
        barColor="#094501"
        value={props.words.length - (props.invalidWords?.length ?? 0)}
        maxValue={props.words.length}
        getValueLabel={({ value, max }) =>
          `${value} out of ${max} (${Math.floor(
            (value / max) * 100
          )}%) guessed correctly`
        }
      >
        <div class="mb-2 text-center">
          <ProgressValueLabel />
        </div>
      </Progress>

      <Show when={props.invalidWords}>
        {invalidWords => (
          <section class="mx-auto mt-10 flex flex-col">
            <h2 class="mb-4 text-lg text-center">
              Words you guessed incorrectly
            </h2>

            <ul class="mx-auto max-h-64 overflow-y-auto">
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
        <Show when={props.invalidWords}>
          {invalidWords => (
            <Button
              class="btn-link"
              type="button"
              onClick={() => props.tryInvalidWords(invalidWords())}
            >
              Practice incorrect
            </Button>
          )}
        </Show>
        <Button type="button" variant="secondary" onClick={props.repeat}>
          Test again
        </Button>
        <A class="text-primary text-sm" href="..">
          Back to Vocabulary
        </A>
      </div>
    </div>
  );
}
