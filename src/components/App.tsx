import { A } from '@solidjs/router';
import { HiOutlineBars3 } from 'solid-icons/hi';
import { Component, JSX } from 'solid-js';
import { Button } from '~/components/ui/button';
import { signOut } from '~/domains/auth/auth-resource';
import logo from '../assets/logo.svg';
import { AccountButton } from '../domains/auth/AccountButton';
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
  return (
    <>
      <nav>
        <div class="hidden sm:flex items-center px-4 py-2 border-b">
          <A href="/dashboard" class="flex items-center">
            <img src={logo} alt="logo" class="size-8" />
            <span class="mr-8">Easywords</span>
          </A>
          <A class={styles.navLink} href="/dashboard">
            <Button class="font-normal text-inherit px-2" variant="link">
              Dashboard
            </Button>
          </A>
          <A class={styles.navLink} href="/vocabulary">
            <Button class="font-normal text-inherit px-2" variant="link">
              Vocabulary
            </Button>
          </A>
          <A class={styles.navLink} href="/conjugations">
            <Button class="font-normal text-inherit px-2" variant="link">
              Conjugations
            </Button>
          </A>
          <div class="ml-auto">
            <AccountButton loggedIn={true} onSignOut={signOut} />
          </div>
        </div>
        <div class="sm:hidden flex items-center gap-4 p-2">
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
                  class="sm:hidden p-0 text-base font-normal bg-inherit"
                  variant="ghost"
                  onClick={signOut}
                >
                  Sign out
                </Button>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>
      <main class="flex-grow w-full grid">{props.children}</main>
    </>
  );
};

export default App;
