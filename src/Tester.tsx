import { Show, createSignal } from 'solid-js';
import { WordTranslation } from './parser/simple-md-parser';
import { nextWord } from './worder/worder';

interface TesterProps {
  words: WordTranslation[];
}

const Tester = (props: TesterProps) => {
  const [wordsLeft, setWordsLeft] = createSignal<WordTranslation[]>(
    props.words
  );
  const [currentWord, setCurrentWord] = createSignal<WordTranslation>();

  function start() {
    next();
  }

  function next() {
    const [word, index] = nextWord(wordsLeft());

    setCurrentWord(word);
    setWordsLeft(w => w.filter((_, i) => i !== index));
  }

  const done = () => wordsLeft()?.length === 0;

  return (
    <div>
      <p>
        {currentWord()?.original} - {currentWord()?.translation}
      </p>
      <button class="btn-primary" onClick={start}>
        Start
      </button>
      <Show when={currentWord() && !done()} fallback={done() && 'done!'}>
        <button class="btn-primary" onClick={next}>
          Next
        </button>
      </Show>
    </div>
  );
};

export default Tester;
