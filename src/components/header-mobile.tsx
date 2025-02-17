import logo from '../assets/logo.svg';
import { A, useCurrentMatches } from '@solidjs/router';
import { HiOutlineBars3 } from 'solid-icons/hi';
import type { Component } from 'solid-js';
import { For } from 'solid-js';
import { Button } from './ui/button';
import {
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenu,
} from './ui/dropdown-menu';

type Props = {
  links: { label: string; href: string }[];
  onSignOut: () => void;
};

export const HeaderMobile: Component<Props> = props => {
  const routeMatches = useCurrentMatches();
  const currentTitle = () => {
    const matchedLink = props.links.find(l =>
      routeMatches().find(m => m.path === l.href)
    );
    return matchedLink?.label || '';
  };

  return (
    <div class="flex items-center gap-4 p-2 sm:hidden">
      <A href="/" class="flex items-center">
        <img src={logo} alt="logo" class="size-8" />
      </A>
      <span class="mx-auto">{currentTitle()}</span>
      <DropdownMenu>
        <DropdownMenuTrigger
          as={(props: object) => (
            <Button {...props} class="p-0" variant="ghost">
              <HiOutlineBars3 class="size-8" />
            </Button>
          )}
        />
        <DropdownMenuContent class="p-4">
          <For each={props.links}>
            {link => (
              <DropdownMenuItem class="text-base">
                <A href={link.href}>{link.label}</A>
              </DropdownMenuItem>
            )}
          </For>
          <DropdownMenuSeparator />
          <DropdownMenuItem class="text-base">
            <Button
              class="bg-inherit p-0 text-base font-normal sm:hidden"
              variant="ghost"
              onClick={props.onSignOut}
            >
              Sign out
            </Button>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
