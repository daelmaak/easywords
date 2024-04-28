import { HiOutlineUser } from 'solid-icons/hi';
import { Component, Show } from 'solid-js';
import { AuthDialog } from './AuthDialog';
import { Button } from '~/components/ui/button';
import {
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenu,
  DropdownMenuContent,
} from '~/components/ui/dropdown-menu';

interface Props {
  loggedIn: boolean;
  onSignOut?: () => void;
}

export const AccountButton: Component<Props> = props => {
  return (
    <>
      <Show when={!props.loggedIn}>
        <AuthDialog
          mode="signin"
          trigger={
            <Button size="sm" variant="outline">
              Sign In
            </Button>
          }
        />
      </Show>
      <Show when={props.loggedIn}>
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button
              class="hidden sm:flex p-0 text-base font-normal"
              variant="ghost"
            >
              <HiOutlineUser size={20} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent class="p-4">
            <DropdownMenuItem class="text-base">
              <Button
                class="p-0 text-base font-normal bg-inherit"
                variant="ghost"
                onClick={props.onSignOut}
              >
                Sign out
              </Button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </Show>
    </>
  );
};
