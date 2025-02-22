import type { Component } from 'solid-js';
import { createEffect, Show } from 'solid-js';
import { ConjugationsResults } from './ConjugationsResults';
import type { TensesValidations } from './ConjugationsTester';
import { ConjugationsTester } from './ConjugationsTester';
import { TenseFilter } from './tense-filter/TenseFilter';
import type { VerbConjugations, Tense } from '../resources/conjugations-api';
import { createStore } from 'solid-js/store';

type Props = {
  verb: string;
  verbConjugations: VerbConjugations;
};

interface ConjugationsViewState {
  selectedTenses: Tense[];
  tensesResults: TensesValidations;
  practiceIncorrect: boolean;
  testingDone: boolean;
  verbLoading: boolean;
}

const getInitialState: () => ConjugationsViewState = () => ({
  selectedMoods: [],
  selectedTenses: [],
  tensesResults: {},
  practiceIncorrect: false,
  testingDone: false,
  verbLoading: false,
});

export const ConjugationsTestView: Component<Props> = props => {
  const [state, setState] =
    createStore<ConjugationsViewState>(getInitialState());

  createEffect(prevVerb => {
    if (props.verb === prevVerb) {
      return;
    }
    reset();
  });

  const selectedTenses = () =>
    state.practiceIncorrect ? incorrectTenses() : state.selectedTenses;

  const incorrectTenses = () =>
    props.verbConjugations?.tenses.filter(t =>
      state.tensesResults[t.name]?.some(v => v.valid === false)
    );

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

  const onPracticeIncorrect = () => {
    setState({ testingDone: false, practiceIncorrect: true });
  };

  const reset = () => setState(getInitialState());

  const selectTenses = (selectedTenses: Tense[]) => {
    setState({ selectedTenses });

    if (state.testingDone) {
      setState('testingDone', false);
    }
  };

  return (
    <>
      <Show when={!state.testingDone}>
        <div class="mt-4 grid items-start gap-4 md:grid-cols-[1fr_2fr]">
          <Show when={!state.practiceIncorrect}>
            <Show when={props.verbConjugations}>
              {verbConjugations => (
                <div class="rounded-lg bg-white p-4 shadow-md">
                  <TenseFilter
                    tenses={verbConjugations().tenses}
                    selectedTenses={state.selectedTenses}
                    onSelectedTenses={selectTenses}
                  />
                </div>
              )}
            </Show>
          </Show>
          <Show when={selectedTenses()?.length}>
            <div class="rounded-lg bg-white p-4 shadow-md">
              <ConjugationsTester
                selectedTenses={selectedTenses()!}
                onDone={onTestingDone}
              />
            </div>
          </Show>
        </div>
      </Show>
      <Show when={state.testingDone}>
        <ConjugationsResults
          tensesValidations={state.tensesResults}
          onTryAgain={onTryAgain}
          onTryDifferent={reset}
          onPracticeIncorrect={onPracticeIncorrect}
        />
      </Show>
    </>
  );
};
