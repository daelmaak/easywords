import { HiOutlineEye } from 'solid-icons/hi';
import { createEffect, createSignal, Show, type Component } from 'solid-js';
import { Button } from '~/components/ui/button';
import { TestWordResult } from '~/domains/vocabulary-results/model/test-result-model';

export interface GuessTesterProps {
  translation: string;
  onDone: (correctness: TestWordResult) => void;
}

export const GuessTester: Component<GuessTesterProps> = props => {
  const [showSolution, setShowSolution] = createSignal(false);

  createEffect((prevTranslation?: string) => {
    if (prevTranslation == null || prevTranslation === props.translation) {
      return props.translation;
    }

    setShowSolution(false);
    return props.translation;
  });

  function onDone(correctness: TestWordResult) {
    setShowSolution(false);

    props.onDone(correctness);
  }

  return (
    <div>
      <div class="text-center">
        <div>=</div>
        <div>{showSolution() ? props.translation : '?'}</div>
      </div>
      <div class="mt-4 flex gap-2">
        <Show when={!showSolution()}>
          <Button onClick={() => setShowSolution(true)}>
            <HiOutlineEye class="!my-0" size={20} />
            Show solution
          </Button>
        </Show>
        <Show when={showSolution()}>
          <Button
            variant="defaultOutline"
            onClick={() => onDone(TestWordResult.Wrong)}
          >
            Wrong
          </Button>
          <Button
            variant="defaultOutline"
            onClick={() => onDone(TestWordResult.Mediocre)}
          >
            So-So
          </Button>
          <Button
            variant="defaultOutline"
            onClick={() => onDone(TestWordResult.Ok)}
          >
            OK
          </Button>
          <Button
            variant="defaultOutline"
            onClick={() => onDone(TestWordResult.Correct)}
          >
            Easy
          </Button>
        </Show>
      </div>
    </div>
  );
};
