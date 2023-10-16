import { Show } from 'solid-js';
import { WordTranslation } from '../parser/simple-md-parser';

interface ResultsProps {
  invalidWords?: WordTranslation[];
  tryInvalidWords: (invalidWords: WordTranslation[]) => void;
}

export function Results(props: ResultsProps) {
  let invalidWordsRef: HTMLTextAreaElement | undefined;

  function copyInvalidWords() {
    if (!invalidWordsRef) {
      return;
    }

    invalidWordsRef.select();
    navigator.clipboard.writeText(invalidWordsRef.value);
    // TODO: @daelmaak show feedback about the copy
  }

  function formatInvalidWords(
    invalidWords: Required<ResultsProps>['invalidWords']
  ) {
    return invalidWords.reduce(
      (acc, w) => acc + `${w.original} - ${w.translation}` + '\n',
      ''
    );
  }

  return (
    <Show keyed={true} when={props.invalidWords}>
      {invalidWords =>
        invalidWords.length > 0 && (
          <section class="mx-auto mt-10 flex flex-col">
            <h2 class="mb-4 text-lg text-center">
              Words you had hard time guessing or didn't manage:
            </h2>
            <textarea
              class="input text-center"
              name="invalid-words"
              ref={invalidWordsRef}
              rows="5"
              value={formatInvalidWords(invalidWords)}
            ></textarea>
            <div class="mx-auto mt-2">
              <button
                class="btn-link"
                type="button"
                onClick={() => props.tryInvalidWords(invalidWords)}
              >
                Practice them
              </button>
              <button
                class="btn-link ml-4"
                type="button"
                onClick={copyInvalidWords}
              >
                Copy
              </button>
            </div>
          </section>
        )
      }
    </Show>
  );
}
