import { Component, Show, createEffect, createSignal } from 'solid-js';
import { Button } from '../../components/Button';
import { Icon } from '../../components/Icon';

interface Props {
  loggedIn: boolean;
  onSignIn: () => void;
  onSignOut: () => void;
}

export const AccountButton: Component<Props> = props => {
  const [dropDownOpen, setDropDownOpen] = createSignal(false);

  createEffect(() => {
    if (props.loggedIn) {
      return;
    }
    setDropDownOpen(false);
  }, props.loggedIn);

  return (
    <span class="ml-auto relative">
      <Show when={!props.loggedIn}>
        <Button onClick={props.onSignIn}>Sign in</Button>
      </Show>
      <Show when={props.loggedIn}>
        <span
          class="cursor-pointer hover:text-zinc-300"
          onClick={() => setDropDownOpen(!dropDownOpen())}
        >
          <Icon icon="user-circle" />
        </span>
        <dialog
          class="absolute bottom-[-0.25rem] left-1/2 translate-x-[-50%] translate-y-[100%] px-4 py-2 round-md shadow-lg border border-zinc-700 whitespace-nowrap cursor-pointer hover:text-zinc-300"
          open={dropDownOpen()}
        >
          <button onClick={props.onSignOut}>Sign out</button>
        </dialog>
      </Show>
    </span>
  );
};
