import { A } from '@solidjs/router';
import { createSignal, For, lazy, Show } from 'solid-js';
import { Button } from '~/components/ui/button';
import { WordEditorDialog } from '~/domains/vocabularies/components/WordEditorDialog';
import type { VocabularyItem } from '~/domains/vocabularies/model/vocabulary-model';
import { ResultWord } from './ResultWord';
import type { TestResult } from '~/domains/vocabulary-results/model/test-result-model';

interface ResultsProps {
  results: TestResult;
  words: VocabularyItem[];
  editWord: (word: VocabularyItem) => void;
  onRepeatAll: () => void;
  onRepeatInvalid: (invalidWords: VocabularyItem[]) => void;
}

const TestResultsVisualisation = lazy(
  () =>
    import('~/domains/vocabulary-results/components/TestResultsVisualisation')
);

export function Results(props: ResultsProps) {
  const [wordToEdit, setWordToEdit] = createSignal<VocabularyItem>();

  const invalidWords = () =>
    props.results.words
      .filter(word => word.invalidAttempts > 0)
      .map(word => props.words.find(w => w.id === word.id)!);

  const feedbackText = () => {
    if (invalidWords().length === 0) {
      return 'You are awesome, you got all words right!';
    }

    const percentCorrect =
      (props.results.words.filter(w => w.done && w.invalidAttempts === 0)
        .length /
        props.results.words.length) *
      100;

    if (percentCorrect > 90) {
      return 'Great job! You are so close to perfection!';
    }

    if (percentCorrect > 65) {
      return 'Good job! Keep practicing and you will be a ⭐!';
    }

    return "Not bad! Next time it's going to be better for sure!";
  };

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

      <figure class="mx-auto">
        <div class="mx-auto w-40 lg:w-48">
          <TestResultsVisualisation result={props.results} />
        </div>
        <figcaption class="mt-8 text-lg">{feedbackText()}</figcaption>
      </figure>

      <Show when={invalidWords().length}>
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
      </Show>

      <div class="mx-auto mt-8 flex flex-wrap justify-center items-center gap-4 sm:mt-16">
        <Show when={invalidWords().length}>
          <Button
            class="btn-link"
            type="button"
            onClick={() => props.onRepeatInvalid(invalidWords())}
          >
            Practice incorrect
          </Button>
        </Show>
        <Button
          type="button"
          variant={invalidWords().length > 0 ? 'secondary' : 'default'}
          onClick={props.onRepeatAll}
        >
          Test all again
        </Button>
        <A class="text-primary text-sm" href="../..">
          Back to Vocabulary
        </A>
      </div>
    </div>
  );
}
