import { HiOutlineUser } from 'solid-icons/hi';
import type { Component } from 'solid-js';
import { Show } from 'solid-js';
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
              class="hidden p-0 text-base font-normal sm:flex"
              variant="ghost"
            >
              <HiOutlineUser size={20} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent class="p-4">
            <DropdownMenuItem class="text-base">
              <Button
                class="bg-inherit p-0 text-base font-normal"
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
