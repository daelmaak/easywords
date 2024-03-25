import { useSearchParams } from '@solidjs/router';
import { Component, For, JSX, createResource } from 'solid-js';
import { Button } from '~/components/ui/button';
import { AccountButton } from '../domains/auth/AccountButton';
import { supabase } from '../lib/supabase-client';
import { Lang, langs } from '../model/lang';
import { LangContext } from './language-context';

interface Props {
  children?: JSX.Element;
}

const App: Component<Props> = props => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [loggedIn, { mutate: setLoggedIn }] = createResource(
    async () => (await supabase.auth.getSession()).data.session?.user != null
  );

  const currentLang = () => (searchParams.lang as Lang) ?? 'pt';

  const changeLang = (value: string) => {
    setSearchParams({ lang: value as Lang });
  };

  const onSignIn = () => {
    setLoggedIn(true);
  };

  const onSignUp = () => {
    console.log('signed up');
  };

  const onSignOut = async () => {
    await supabase.auth.signOut();
    setLoggedIn(false);
  };

  return (
    <LangContext.Provider value={currentLang}>
      <nav class="flex items-center">
        <a href="/vocabulary">
          <Button class="text-inherit" variant="link">
            Vocabulary
          </Button>
        </a>
        <a href="/conjugations">
          <Button class="text-inherit" variant="link">
            Conjugations
          </Button>
        </a>
        <AccountButton
          loggedIn={!!loggedIn()}
          onSignIn={onSignIn}
          onSignOut={onSignOut}
          onSignUp={onSignUp}
        />
        <select
          class="select"
          onChange={e => changeLang(e.currentTarget.value)}
          value={currentLang()}
        >
          <For each={langs}>{lang => <option value={lang}>{lang}</option>}</For>
        </select>
      </nav>
      <main class="flex-grow w-full py-8 grid">{props.children}</main>
    </LangContext.Provider>
  );
};

export default App;
