import type { Component } from 'solid-js';
import { Show } from 'solid-js';
import { createStore } from 'solid-js/store';
import type { ConjugationLanguageCode } from '~/model/lang';
import { ConjugationsResults } from './ConjugationsResults';
import type { TensesValidations } from './ConjugationsTester';
import { ConjugationsTester } from './ConjugationsTester';
import { VerbInput } from './VerbInput';
import { TenseFilter } from './tense-filter/TenseFilter';
import type { Tense, VerbConjugations } from '../resources/conjugations-api';
import { fetchVerbixConjugations } from '../resources/conjugations-api';

interface ConjugationsViewState {
  verbConjugations?: VerbConjugations;
  selectedTenses: Tense[];
  tensesResults: TensesValidations;
  practiceIncorrect: boolean;
  testingDone: boolean;
  verbLoading: boolean;
}

const getInitialState: () => ConjugationsViewState = () => ({
  verbConjugations: undefined,
  selectedMoods: [],
  selectedTenses: [],
  tensesResults: {},
  practiceIncorrect: false,
  testingDone: false,
  verbLoading: false,
});

export const ConjugationsView: Component = () => {
  let verbInputEl: HTMLInputElement | undefined;

  const [state, setState] =
    createStore<ConjugationsViewState>(getInitialState());

  const incorrectTenses = () =>
    state.verbConjugations?.tenses.filter(t =>
      state.tensesResults[t.name]?.some(v => v.valid === false)
    );

  const selectedTenses = () =>
    state.practiceIncorrect ? incorrectTenses() : state.selectedTenses;

  const applyVerb = async (verb: string, lang: ConjugationLanguageCode) => {
    reset();
    setState('verbLoading', true);

    const verbConjugations = await fetchVerbixConjugations(lang, verb);
    setState({
      verbConjugations,
      verbLoading: false,
    });
  };

  const reset = () => setState(getInitialState());

  const selectTenses = (selectedTenses: Tense[]) => {
    setState({ selectedTenses });

    if (state.testingDone) {
      setState('testingDone', false);
    }
  };

  const onTestingDone = (validationResults: TensesValidations) => {
    setState({ testingDone: true, tensesResults: validationResults });
  };

  const onTryAgain = () => {
    setState({
      tensesResults: {},
      testingDone: false,
      practiceIncorrect: false,
    });
  };

  const onTryDifferent = () => {
    setState({
      ...getInitialState(),
      verbConjugations: state.verbConjugations,
    });
  };

  const onPracticeIncorrect = () => {
    setState({ testingDone: false, practiceIncorrect: true });
  };

  return (
    <div class="page-container flex flex-col items-center">
      <h1 class="mb-4 text-xl">Insert verb to conjugate</h1>
      <div class="flex flex-col items-center gap-2">
        <span class="text-sm">
          Using{' '}
          <a href="https://www.verbix.com/" target="_blank">
            verbix.com
          </a>
        </span>
        <VerbInput
          onApplyVerb={applyVerb}
          ref={verbInputEl}
          verbLoading={state.verbLoading}
        />
      </div>
      <div class="mt-8"></div>
      <Show when={!state.testingDone}>
        <Show when={!state.practiceIncorrect}>
          <Show when={state.verbConjugations}>
            {verbConjugations => (
              <TenseFilter
                tenses={verbConjugations().tenses}
                selectedTenses={state.selectedTenses}
                onSelectedTenses={selectTenses}
              />
            )}
          </Show>
        </Show>
        <div class="mt-8"></div>
        <Show when={selectedTenses()}>
          {selectedTenses => (
            <ConjugationsTester
              selectedTenses={selectedTenses()}
              onDone={onTestingDone}
            />
          )}
        </Show>
      </Show>
      <Show when={state.testingDone}>
        <ConjugationsResults
          tensesValidations={state.tensesResults}
          onTryAgain={onTryAgain}
          onTryDifferent={onTryDifferent}
          onPracticeIncorrect={onPracticeIncorrect}
        />
      </Show>
    </div>
  );
};

export default ConjugationsView;
