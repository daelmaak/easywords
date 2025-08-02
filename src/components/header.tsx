import logo from '../assets/logo.svg';
import { Button } from './ui/button';
import styles from './header.module.css';
import { For, type Component } from 'solid-js';
import { A } from '@solidjs/router';
import { AccountButton } from '~/domains/auth/AccountButton';
import { Routes } from '~/routes/routes';
import { HeaderMobile } from './header-mobile';

interface Props {
  onSignOut: () => void;
}

const links = [
  { label: 'Vocabularies', href: Routes.Vocabularies },
  { label: 'Conjugations', href: Routes.Conjugations },
];

export const Header: Component<Props> = props => {
  return (
    <nav aria-label="Main navigation">
      <div class="hidden items-center border-b px-4 py-2 sm:flex">
        <A href="/vocabularies" class="flex items-center">
          <img src={logo} alt="logo" class="size-8" />
          <span class="mr-8">Easywords</span>
        </A>
        <For each={links}>
          {link => (
            <A class={styles.navLink} href={link.href}>
              <Button class="px-2 font-normal text-inherit" variant="link">
                {link.label}
              </Button>
            </A>
          )}
        </For>
        <div class="ml-auto">
          <AccountButton loggedIn={true} onSignOut={props.onSignOut} />
        </div>
      </div>
      <HeaderMobile links={links} onSignOut={props.onSignOut} />
    </nav>
  );
};
