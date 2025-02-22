import { Show, type Component } from 'solid-js';
import { createStore } from 'solid-js/store';
import type { ConjugationLanguageCode } from '~/model/lang';
import { VerbInput } from './VerbInput';
import type { VerbConjugations } from '../resources/conjugations-api';
import { fetchVerbixConjugations } from '../resources/conjugations-api';
import { ConjugationsTestView } from './ConjugationsTestView';

const LANG_STORAGE_KEY = 'conjugations-lang-storage-key';

type State = {
  mode: 'search' | 'test';
  verb: string;
  verbLoading: boolean;
  verbConjugations: VerbConjugations | undefined;
};

export const ConjugationsView: Component = () => {
  let verbInputEl: HTMLInputElement | undefined;
  const [state, setState] = createStore<State>({
    mode: 'search',
    verb: '',
    verbLoading: false,
    verbConjugations: undefined as VerbConjugations | undefined,
  });

  const applyVerb = async (verb: string, lang: ConjugationLanguageCode) => {
    setState({
      verb,
      verbLoading: true,
    });

    const verbConjugations = await fetchVerbixConjugations(lang, verb);
    setState({
      verbConjugations,
      verbLoading: false,
    });
  };

  const onLangChange = (lang: ConjugationLanguageCode) => {
    localStorage.setItem(LANG_STORAGE_KEY, lang);
  };

  return (
    <div class="flex min-h-full flex-col items-center bg-neutral-100 p-2 md:p-4">
      <div class="flex flex-col items-center gap-2 rounded-lg p-4">
        <VerbInput
          onApplyVerb={applyVerb}
          onLangChange={onLangChange}
          ref={verbInputEl}
          defaultLang={
            localStorage.getItem(LANG_STORAGE_KEY) as
              | ConjugationLanguageCode
              | undefined
          }
          verbLoading={state.verbLoading}
        />
        <span class="text-sm">
          Using{' '}
          <a href="https://www.verbix.com/" target="_blank">
            verbix.com
          </a>
        </span>
      </div>
      <Show when={state.verbConjugations}>
        {conjugations => (
          <Show when={state.mode === 'search'}>
            <ConjugationsTestView
              verb={state.verb}
              verbConjugations={conjugations()}
            />
          </Show>
        )}
      </Show>
    </div>
  );
};

export default ConjugationsView;
