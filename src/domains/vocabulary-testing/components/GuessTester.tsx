import { HiOutlineEye, HiOutlineLightBulb } from 'solid-icons/hi';
import { createEffect, createSignal, Show, type Component } from 'solid-js';
import { Button } from '~/components/ui/button';
import { TestWordStatus } from '~/domains/vocabulary-results/model/test-result-model';

export interface GuessTesterProps {
  translation: string;
  onDone: (correctness: TestWordStatus) => void;
  onShowDown: () => void;
  delimiter?: string;
}

export const GuessTester: Component<GuessTesterProps> = props => {
  const delimiter = () => props.delimiter ?? ',';
  const [showSolution, setShowSolution] = createSignal(false);
  const [showHint, setShowHint] = createSignal(false);

  createEffect((prevTranslation?: string) => {
    if (prevTranslation == null || prevTranslation === props.translation) {
      return props.translation;
    }

    setShowSolution(false);
    setShowHint(false);
    return props.translation;
  });

  function onDone(correctness: TestWordStatus) {
    setShowSolution(false);
    setShowHint(false);

    props.onDone(correctness);
  }

  function onShowDown() {
    setShowSolution(true);
    props.onShowDown();
  }

  function onShowHint() {
    setShowHint(true);
  }

  function createHintDisplay(translation: string): string {
    if (translation.length <= 2) {
      return '_'.repeat(translation.length);
    }
    return translation
      .split(delimiter())
      .map(item => {
        const trimmed = item.trim();
        const hinted = trimmed
          .split(' ')
          .map(word => {
            if (word.length <= 2) return '_'.repeat(word.length);
            const first = word[0];
            const last = word[word.length - 1];
            const middle = '_'.repeat(word.length - 2);
            return first + middle + last;
          })
          .join(' ');

        // Preserve original spacing around the item
        return item.replace(trimmed, hinted);
      })
      .join(delimiter() + ' ');
  }

  return (
    <div>
      <div class="text-center">
        <div>=</div>
        <div class="tracking-wider">
          {showSolution()
            ? props.translation
            : showHint()
              ? createHintDisplay(props.translation)
              : '?'}
        </div>
      </div>
      <div class="mt-4 flex gap-2">
        <Show when={!showSolution()}>
          <Button
            onClick={onShowHint}
            variant="defaultOutline"
            disabled={showHint()}
          >
            <HiOutlineLightBulb class="!my-0" size={20} />
            Hint
          </Button>
          <Button onClick={onShowDown}>
            <HiOutlineEye class="!my-0" size={20} />
            Show solution
          </Button>
        </Show>
        <Show when={showSolution()}>
          <Button
            variant="defaultOutline"
            onClick={() => onDone(TestWordStatus.Wrong)}
          >
            Wrong
          </Button>
          <Button
            variant="defaultOutline"
            onClick={() => onDone(TestWordStatus.Fair)}
          >
            So-So
          </Button>
          <Button
            variant="defaultOutline"
            onClick={() => onDone(TestWordStatus.Good)}
          >
            OK
          </Button>
          <Button
            variant="defaultOutline"
            onClick={() => onDone(TestWordStatus.Correct)}
          >
            Easy
          </Button>
        </Show>
      </div>
    </div>
  );
};
