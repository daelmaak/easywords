import { A } from '@solidjs/router';
import { createSignal, lazy, Show } from 'solid-js';
import { Button } from '~/components/ui/button';
import { WordEditorDialog } from '~/domains/vocabularies/components/WordEditorDialog';
import type { Word } from '~/domains/vocabularies/model/vocabulary-model';
import type { TestResult } from '~/domains/vocabulary-results/model/test-result-model';
import { ResultWordGuessesVisualisation } from './ResultWordGuessesVisualisation';

interface ResultsProps {
  results: TestResult;
  words: Word[];
  editWord: (word: Word) => void;
  onRepeatAll: () => void;
  onRepeatInvalid: (invalidWords: Word[]) => void;
}

const TestResultsVisualisation = lazy(
  () =>
    import('~/domains/vocabulary-results/components/TestResultsVisualisation')
);

export function Results(props: ResultsProps) {
  const [wordToEdit, setWordToEdit] = createSignal<Word>();

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

  function onWordEdited(word: Word) {
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

      <section class="mt-4 mx-auto" data-testid="results-word-breakdown">
        <h2 class="sr-only text-center">Word by word results breakdown</h2>
        <div class="max-h-80 overflow-y-auto">
          <ResultWordGuessesVisualisation
            results={props.results}
            words={props.words}
          />
        </div>
      </section>

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
