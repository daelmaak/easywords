import type { Component } from 'solid-js';
import { createEffect, Show } from 'solid-js';
import { ConjugationsResults } from './ConjugationsResults';
import type { TensesValidations } from './ConjugationsTester';
import { ConjugationsTester } from './ConjugationsTester';
import type { VerbConjugations, Tense } from '../resources/conjugations-api';
import { createStore } from 'solid-js/store';

type Props = {
  selectedTenses: Tense[];
  verb: string;
  verbConjugations: VerbConjugations;
  onExit: () => void;
};

interface ConjugationsViewState {
  tensesResults: TensesValidations;
  practiceIncorrect: boolean;
  testingDone: boolean;
  verbLoading: boolean;
}

const getInitialState: () => ConjugationsViewState = () => ({
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
    state.practiceIncorrect ? incorrectTenses() : props.selectedTenses;

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

  const reset = () => {
    setState(getInitialState());
  };

  const onExit = () => {
    reset();
    props.onExit();
  };

  return (
    <>
      <Show when={!state.testingDone}>
        <Show when={selectedTenses()?.length}>
          <ConjugationsTester
            selectedTenses={selectedTenses()!}
            onDone={onTestingDone}
          />
        </Show>
      </Show>
      <Show when={state.testingDone}>
        <ConjugationsResults
          tensesValidations={state.tensesResults}
          onTryAgain={onTryAgain}
          onExit={onExit}
          onPracticeIncorrect={onPracticeIncorrect}
        />
      </Show>
    </>
  );
};
