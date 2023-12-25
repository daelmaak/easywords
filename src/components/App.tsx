import { Component, createSignal } from 'solid-js';
import VocabularyView from './VocabularyView';

type View = 'vocabulary' | 'conjugations';

const App: Component = () => {
  const [currentView, setCurrentView] = createSignal<View>('vocabulary');

  const switchView = (view: View) => () => setCurrentView(view);

  return (
    <div class="min-h-full p-8 bg-zinc-800 flex flex-col">
      <nav class="flex gap-4">
        <a class="cursor-pointer" onClick={switchView('vocabulary')}>
          Vocabulary
        </a>
        <a class="cursor-pointer" onClick={switchView('conjugations')}>
          Conjugations
        </a>
      </nav>
      <main class="m-auto grid">
        {currentView() === 'vocabulary' ? <VocabularyView /> : null}
      </main>
    </div>
  );
};

export default App;
