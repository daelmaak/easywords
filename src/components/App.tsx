import { A } from '@solidjs/router';
import { HiOutlineBars3 } from 'solid-icons/hi';
import type { Component, JSX } from 'solid-js';
import { Button } from '~/components/ui/button';
import { signOut } from '~/domains/auth/auth-resource';
import logo from '../assets/logo.svg';
import { AccountButton } from '../domains/auth/AccountButton';
import { resetApp } from '../init/app-init';
import styles from './App.module.css';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

interface Props {
  children?: JSX.Element;
}

const App: Component<Props> = props => {
  async function onSignOut() {
    await signOut();
    resetApp();
  }

  return (
    <>
      <nav>
        <div class="hidden items-center border-b px-4 py-2 sm:flex">
          <A href="/dashboard" class="flex items-center">
            <img src={logo} alt="logo" class="size-8" />
            <span class="mr-8">Easywords</span>
          </A>
          <A class={styles.navLink} href="/dashboard">
            <Button class="px-2 font-normal text-inherit" variant="link">
              Dashboard
            </Button>
          </A>
          <A class={styles.navLink} href="/vocabulary">
            <Button class="px-2 font-normal text-inherit" variant="link">
              Vocabularies
            </Button>
          </A>
          <A class={styles.navLink} href="/conjugations">
            <Button class="px-2 font-normal text-inherit" variant="link">
              Conjugations
            </Button>
          </A>
          <div class="ml-auto">
            <AccountButton loggedIn={true} onSignOut={onSignOut} />
          </div>
        </div>
        <div class="flex items-center gap-4 p-2 sm:hidden">
          <A href="/" class="flex items-center">
            <img src={logo} alt="logo" class="size-8" />
          </A>
          <div class="ml-auto">
            <AccountButton loggedIn={true} />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button class="p-0" variant="ghost">
                <HiOutlineBars3 class="size-8" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent class="p-4">
              <DropdownMenuItem class="text-base">
                <A href="/vocabulary">Vocabulary</A>
              </DropdownMenuItem>
              <DropdownMenuItem class="text-base">
                <A href="/conjugations">Conjugations</A>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem class="text-base">
                <Button
                  class="bg-inherit p-0 text-base font-normal sm:hidden"
                  variant="ghost"
                  onClick={onSignOut}
                >
                  Sign out
                </Button>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>
      <div class="w-full flex-grow">{props.children}</div>
    </>
  );
};

export default App;
