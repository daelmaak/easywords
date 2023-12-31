import { Component, For, JSX, createSignal } from 'solid-js';
import { Lang, langs } from '../model/lang';
import { LangContext } from './language-context';

interface Props {
  children?: JSX.Element;
}

const App: Component<Props> = props => {
  // TODO: apply previously selected language
  const [lang, setLang] = createSignal<Lang>('pt');

  return (
    <LangContext.Provider value={lang}>
      <div class="min-h-full p-8 bg-zinc-800 flex flex-col">
        <nav class="flex gap-4">
          <a class="cursor-pointer" href="/vocabulary">
            Vocabulary
          </a>
          <a class="cursor-pointer" href="/conjugations">
            Conjugations
          </a>
          <select
            class="select ml-auto"
            onChange={e => setLang(e.currentTarget.value as Lang)}
          >
            <For each={langs}>
              {lang => <option value={lang}>{lang}</option>}
            </For>
          </select>
        </nav>
        <main class="h-full w-full py-8 grid">{props.children}</main>
      </div>
    </LangContext.Provider>
  );
};

export default App;
