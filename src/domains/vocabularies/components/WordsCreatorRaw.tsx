import type { Component } from 'solid-js';
import { Textarea } from '~/components/ui/textarea';
import type { WordTranslation } from '~/model/word-translation';
import { processFormSubmit } from '~/util/form';

interface Props {
  id: string;
  ref?: HTMLFormElement;
  onChange: (word: WordTranslation[]) => void;
}

export const WordsCreatorRaw: Component<Props> = props => {
  function onAddWordsFromTextArea(e: SubmitEvent) {
    const data = processFormSubmit<{ words: string }>(e);

    const wordsRaw = data.words;
    const words = wordsRaw
      .split('\n')
      .filter(l => l)
      .map(line => {
        const [original, translation] = line.split(' - ').map(w => w.trim());
        return { original, translation };
      });

    props.onChange(words);
  }

  return (
    <form id={props.id} ref={props.ref} onSubmit={onAddWordsFromTextArea}>
      <Textarea
        aria-label="Raw words input"
        aria-describedby="raw-words-input-description"
        name="words"
        required
      ></Textarea>
      <div
        id="raw-words-input-description"
        class="mt-2 text-center text-xs text-zinc-400"
      >
        words have to be in format:
        <figure>
          <pre class="mt-2">
            original - translation
            <br />
            original2 - translation2
          </pre>
        </figure>
      </div>
    </form>
  );
};
