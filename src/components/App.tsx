import { useSearchParams } from '@solidjs/router';
import { Component, For, JSX, createResource } from 'solid-js';
import { AccountButton } from '../domains/auth/AccountButton';
import { AuthDialog } from '../domains/auth/AuthDialog';
import { supabase } from '../lib/supabase-client';
import { Lang, langs } from '../model/lang';
import { A } from './A';
import { LangContext } from './language-context';

interface Props {
  children?: JSX.Element;
}

const App: Component<Props> = props => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [loggedIn, { mutate: setLoggedIn }] = createResource(
    async () => (await supabase.auth.getSession()).data.session?.user != null
  );
  let authDialogRef: HTMLDialogElement | undefined;

  const currentLang = () => (searchParams.lang as Lang) ?? 'pt';

  const changeLang = (value: string) => {
    setSearchParams({ lang: value as Lang });
  };

  const onSignIn = () => {
    authDialogRef?.close();
    setLoggedIn(true);
  };

  const onSignUp = () => {
    console.log('signed up');
    authDialogRef?.close();
  };

  const onSignOut = async () => {
    await supabase.auth.signOut();
    setLoggedIn(false);
  };

  return (
    <LangContext.Provider value={currentLang}>
      <div class="min-h-full py-4 px-8 bg-zinc-800 flex flex-col">
        <nav class="flex items-center gap-4 text-zinc-400">
          <A href="/vocabulary">Vocabulary</A>
          <A href="/conjugations">Conjugations</A>
          <AccountButton
            loggedIn={!!loggedIn()}
            onSignIn={() => authDialogRef?.showModal()}
            onSignOut={onSignOut}
          />
          <select
            class="select"
            onChange={e => changeLang(e.currentTarget.value)}
            value={currentLang()}
          >
            <For each={langs}>
              {lang => <option value={lang}>{lang}</option>}
            </For>
          </select>
        </nav>
        <AuthDialog
          mode="signin"
          onSignIn={onSignIn}
          onSignUp={onSignUp}
          ref={authDialogRef}
        />
        <main class="flex-grow w-full py-8 grid">{props.children}</main>
      </div>
    </LangContext.Provider>
  );
};

export default App;
