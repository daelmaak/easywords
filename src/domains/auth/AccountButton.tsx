import { HiOutlineUser } from 'solid-icons/hi';
import { Component, Show, createEffect, createSignal } from 'solid-js';
import { AuthDialog } from './AuthDialog';

interface Props {
  loggedIn: boolean;
  onSignIn: () => void;
  onSignOut: () => void;
  onSignUp: () => void;
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
    <span class="ml-auto mr-4 relative">
      <Show when={!props.loggedIn}>
        <AuthDialog
          mode="signin"
          onSignIn={props.onSignIn}
          onSignUp={props.onSignUp}
        />
      </Show>
      <Show when={props.loggedIn}>
        <span
          class="cursor-pointer"
          onClick={() => setDropDownOpen(!dropDownOpen())}
        >
          <HiOutlineUser size={20} />
        </span>
        <dialog
          class="absolute bottom-[-0.25rem] left-1/2 translate-x-[-50%] translate-y-[100%] px-4 py-2 round-md shadow-lg border border-zinc-700 whitespace-nowrap cursor-pointer"
          open={dropDownOpen()}
        >
          <button onClick={props.onSignOut}>Sign out</button>
        </dialog>
      </Show>
    </span>
  );
};
