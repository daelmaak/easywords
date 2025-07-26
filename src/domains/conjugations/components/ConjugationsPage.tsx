import { Match, Show, Switch, type Component } from 'solid-js';
import { createStore } from 'solid-js/store';
import type { ConjugationLanguageCode } from '~/model/lang';
import { VerbInput } from './VerbInput';
import type { Tense } from '../resources/conjugations-api';
import { fetchVerbixConjugations } from '../resources/conjugations-api';
import { ConjugationsTestView } from './ConjugationsTestView';
import { ConjugationsTensesView } from './ConjugationsTensesView';
import { useNavigate, useParams } from '@solidjs/router';
import { createQuery } from '@tanstack/solid-query';

const LANG_STORAGE_KEY = 'conjugations-lang-storage-key';

type State = {
  mode: 'search' | 'test';
  selectedTenses: Tense[];
};

export const ConjugationsPage: Component = () => {
  const params = useParams<{ verb: string; lang: ConjugationLanguageCode }>();
  const navigate = useNavigate();

  let verbInputEl: HTMLInputElement | undefined;
  const [state, setState] = createStore<State>({
    mode: 'search',
    selectedTenses: [],
  });

  const conjugationsQuery = createQuery(() => ({
    enabled: params.lang != null && params.verb != null,
    queryKey: ['conjugations', params.lang, params.verb],
    queryFn: () => fetchVerbixConjugations(params.lang, params.verb),
    retry: false,
  }));

  const applyVerb = (verb: string, lang: ConjugationLanguageCode) => {
    setState({
      mode: 'search',
      selectedTenses: [],
    });
    navigate(`/conjugations/${lang}/${verb}`);
  };

  const onLangChange = (lang: ConjugationLanguageCode) => {
    localStorage.setItem(LANG_STORAGE_KEY, lang);
  };

  const onTenseSelected = (tense: Tense, selected: boolean) => {
    if (selected) {
      setState('selectedTenses', state.selectedTenses.length, tense);
    } else {
      setState('selectedTenses', ts => ts.filter(t => t.name !== tense.name));
    }
  };

  const onTest = () => {
    setState({
      mode: 'test',
    });
  };

  const onTestExit = () => {
    setState({
      mode: 'search',
      selectedTenses: [],
    });
  };

  return (
    <div class="w-full p-2 md:p-4">
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
          verbLoading={conjugationsQuery.isFetching}
          verbNotFound={conjugationsQuery.data?.exists === false}
        />
        <span class="text-sm">
          Using{' '}
          <a href="https://www.verbix.com/" target="_blank">
            verbix.com
          </a>
        </span>
      </div>

      <main class="mx-auto px-8">
        <Show when={conjugationsQuery.data?.exists}>
          <Switch>
            <Match when={state.mode === 'search'}>
              <ConjugationsTensesView
                verb={params.verb}
                verbConjugations={conjugationsQuery.data!}
                selectedTenses={state.selectedTenses}
                onTenseSelected={onTenseSelected}
                onTest={onTest}
              />
            </Match>
            <Match when={state.mode === 'test'}>
              <ConjugationsTestView
                selectedTenses={state.selectedTenses}
                verb={params.verb}
                verbConjugations={conjugationsQuery.data!}
                onExit={onTestExit}
              />
            </Match>
          </Switch>
        </Show>
      </main>
    </div>
  );
};

export default ConjugationsPage;
