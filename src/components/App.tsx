import { A } from '@solidjs/router';
import { Component, JSX } from 'solid-js';
import { Button } from '~/components/ui/button';
import { isLoggedIn, sessionResource } from '~/domains/auth/auth-resource';
import logo from '../assets/logo.svg';
import { AccountButton } from '../domains/auth/AccountButton';
import styles from './App.module.css';

interface Props {
  children?: JSX.Element;
}

const App: Component<Props> = props => {
  const [session] = sessionResource;

  const loggedIn = () => isLoggedIn(session());

  return (
    <>
      <nav class="flex items-center p-2 sm:px-4 border-b">
        <A href="/" class="flex items-center">
          <img src={logo} alt="logo" class="size-8" />
          <span class="mr-8">Easywords</span>
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
        <AccountButton loggedIn={!!loggedIn()} />
      </nav>
      <main class="flex-grow w-full px-4 sm:px-6 py-6 grid">
        {props.children}
      </main>
    </>
  );
};

export default App;
