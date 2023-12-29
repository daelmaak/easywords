import { Component, JSX } from 'solid-js';

interface Props {
  children?: JSX.Element;
}

const App: Component<Props> = props => {
  return (
    <div class="min-h-full h-full p-8 bg-zinc-800 flex flex-col">
      <nav class="flex gap-4">
        <a class="cursor-pointer" href="/vocabulary">
          Vocabulary
        </a>
        <a class="cursor-pointer" href="/conjugations">
          Conjugations
        </a>
      </nav>
      <main class="h-full w-full p-8 grid">{props.children}</main>
    </div>
  );
};

export default App;
