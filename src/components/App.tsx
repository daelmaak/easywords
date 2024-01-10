import { useSearchParams } from '@solidjs/router';
import { Component, For, JSX } from 'solid-js';
import { Lang, langs } from '../model/lang';
import { A } from './A';
import { LangContext } from './language-context';

interface Props {
  children?: JSX.Element;
}

const App: Component<Props> = props => {
  const [searchParams, setSearchParams] = useSearchParams();

  const currentLang = () => (searchParams.lang as Lang) ?? 'pt';

  const changeLang = (value: string) => {
    setSearchParams({ lang: value as Lang });
  };

  return (
    <LangContext.Provider value={currentLang}>
      <div class="min-h-full p-8 bg-zinc-800 flex flex-col">
        <nav class="flex gap-4">
          <A href="/vocabulary">Vocabulary</A>
          <A href="/conjugations">Conjugations</A>
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
        <main class="flex-grow w-full py-8 grid">{props.children}</main>
      </div>
    </LangContext.Provider>
  );
};

export default App;
