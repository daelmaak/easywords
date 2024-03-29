import { useNavigate, useParams, useSearchParams } from '@solidjs/router';
import { Component, onMount, Show, useContext } from 'solid-js';
import { createStore } from 'solid-js/store';
import { LangContext } from '../../../components/language-context';
import {
  Conjugation,
  groupConjugationsByMood,
  groupConjugationsByTense,
} from '../conjugation';
import { fetchConjugationsByTense } from '../conjugations-api';
import { ConjugationsResults } from './ConjugationsResults';
import {
  ConjugationsTester,
  ConjugationValidations,
} from './ConjugationsTester';
import { TenseFilter } from './tense-filter/TenseFilter';
import { VerbInput } from './VerbInput';

interface ConjugationsViewState {
  conjugations: Conjugation[];
  selectedMoods: string[];
  selectedTenses: string[];
  conjugationsResults: ConjugationValidations;
  practiceIncorrect: boolean;
  testingDone: boolean;
  verbLoading: boolean;
}

const getInitialState: () => ConjugationsViewState = () => ({
  conjugations: [],
  selectedMoods: [],
  selectedTenses: [],
  conjugationsResults: {},
  practiceIncorrect: false,
  testingDone: false,
  verbLoading: false,
});

export const ConjugationsView: Component = () => {
  const params = useParams();
  const navigate = useNavigate();
  let verbInputEl: HTMLInputElement | undefined;

  const lang = useContext(LangContext);
  const [state, setState] = createStore<ConjugationsViewState>(
    getInitialState()
  );

  const incorrectConjugations = () =>
    Object.values(state.conjugationsResults)
      .flat()
      .filter(c => !c.valid)
      .map(c => c.conjugation);

  const conjugationsByMood = () => groupConjugationsByMood(state.conjugations);

  const selectedConjugations = () => {
    const conjugationsByTense = groupConjugationsByTense(
      state.practiceIncorrect ? incorrectConjugations() : state.conjugations
    );

    return (
      state.selectedTenses
        .map(tense => ({
          tense,
          conjugations: conjugationsByTense[tense],
        }))
        // Filter out tenses that have no conjugations. This can happen only when
        // practicing incorrect conjugations.
        .filter(c => c.conjugations?.length > 0)
    );
  };

  onMount(() => {
    const verb = params.verb;

    if (verb) {
      applyVerb(verb, false);
      verbInputEl!.value = verb;
    }
  });

  const applyVerb = async (verb: string, follow = true) => {
    reset();

    if (follow) {
      navigate(`/conjugations/${verb}`);
    }

    setState('verbLoading', true);

    const conjugations = await fetchConjugationsByTense(verb, lang());

    setState({
      conjugations,
      verbLoading: false,
    });
  };

  const reset = () => setState(getInitialState());

  const selectTenses = (selectedTenses: string[]) => {
    setState({ selectedTenses });

    if (state.testingDone) {
      setState('testingDone', false);
    }
  };

  const onTestingDone = (validationResults: ConjugationValidations) => {
    setState({ testingDone: true, conjugationsResults: validationResults });
  };

  const onTryAgain = () => {
    setState({
      conjugationsResults: {},
      testingDone: false,
      practiceIncorrect: false,
    });
  };

  const onTryDifferent = () => {
    setState({
      ...getInitialState(),
      conjugations: state.conjugations,
    });
  };

  const onPracticeIncorrect = () => {
    setState({ testingDone: false, practiceIncorrect: true });
  };

  return (
    <div class="flex flex-col items-center">
      <h1 class="mb-4 text-xl">Insert verb to conjugate</h1>
      <VerbInput
        onApplyVerb={applyVerb}
        ref={verbInputEl}
        verbLoading={state.verbLoading}
      />
      <div class="mt-8"></div>
      <Show when={!state.testingDone}>
        <Show when={!state.practiceIncorrect}>
          <TenseFilter
            conjugationsByMood={conjugationsByMood()}
            lang={lang()}
            selectedMoods={state.selectedMoods}
            selectedTenses={state.selectedTenses}
            onSelectedMoods={m => setState({ selectedMoods: m })}
            onSelectedTenses={selectTenses}
          />
        </Show>
        <div class="mt-8"></div>
        <ConjugationsTester
          conjugations={selectedConjugations()}
          onDone={onTestingDone}
        />
      </Show>
      <Show when={state.testingDone}>
        <>
          <ConjugationsResults
            conjugationsResults={state.conjugationsResults}
            onTryAgain={onTryAgain}
            onTryDifferent={onTryDifferent}
            onPracticeIncorrect={onPracticeIncorrect}
          />
        </>
      </Show>
    </div>
  );
};
