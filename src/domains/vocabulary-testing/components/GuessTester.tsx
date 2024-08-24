import { HiOutlineEye } from 'solid-icons/hi';
import { createSignal, Show, type Component } from 'solid-js';
import { Button } from '~/components/ui/button';

export interface GuessTesterProps {
  translation: string;
  onDone: () => void;
}

export const GuessTester: Component<GuessTesterProps> = props => {
  const [showSolution, setShowSolution] = createSignal(false);

  function onDone() {
    setShowSolution(false);

    props.onDone();
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
          <Button variant="defaultOutline" onClick={onDone}>
            Hard
          </Button>
          <Button variant="defaultOutline" onClick={onDone}>
            So-So
          </Button>
          <Button variant="defaultOutline" onClick={onDone}>
            OK
          </Button>
          <Button variant="defaultOutline" onClick={onDone}>
            Easy
          </Button>
        </Show>
      </div>
    </div>
  );
};
