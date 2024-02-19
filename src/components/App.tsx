import { useSearchParams } from '@solidjs/router';
import { Component, For, JSX } from 'solid-js';
import { Lang, langs } from '../model/lang';
import { A } from './A';
import { LangContext } from './language-context';
import { Button } from './Button';
import { AuthDialog } from '../domains/auth/AuthDialog';

interface Props {
  children?: JSX.Element;
}

const App: Component<Props> = props => {
  const [searchParams, setSearchParams] = useSearchParams();
  let authDialogRef: HTMLDialogElement | undefined;

  const currentLang = () => (searchParams.lang as Lang) ?? 'pt';

  const changeLang = (value: string) => {
    setSearchParams({ lang: value as Lang });
  };

  const onSignIn = () => {
    console.log('signed in');
    authDialogRef?.close();
  };

  const onSignUp = () => {
    console.log('signed up');
    authDialogRef?.close();
  };

  return (
    <LangContext.Provider value={currentLang}>
      <div class="min-h-full p-8 bg-zinc-800 flex flex-col">
        <nav class="flex items-center gap-4">
          <A href="/vocabulary">Vocabulary</A>
          <A href="/conjugations">Conjugations</A>
          <Button onClick={() => authDialogRef?.showModal()}>Log in</Button>
          <select
            class="select ml-auto"
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
