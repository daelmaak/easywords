import { useNavigate, useParams } from '@solidjs/router';
import { get, set } from 'idb-keyval';
import type { Component } from 'solid-js';
import { Show, onMount } from 'solid-js';
import { createStore } from 'solid-js/store';
import type { ConjugationLang } from '~/model/lang';
import type { Conjugation } from '../conjugation';
import {
  groupConjugationsByMood,
  groupConjugationsByTense,
} from '../conjugation';
import { fetchConjugationsByTense } from '../conjugations-api';
import { ConjugationsResults } from './ConjugationsResults';
import type { ConjugationValidations } from './ConjugationsTester';
import { ConjugationsTester } from './ConjugationsTester';
import { VerbInput } from './VerbInput';
import { TenseFilter } from './tense-filter/TenseFilter';

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

  const [state, setState] = createStore<ConjugationsViewState>(
    getInitialState()
  );

  const language = () => params.lang as ConjugationLang | undefined;

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

  onMount(async () => {
    const verb = params.verb;
    const lang = language() ?? (await get('conjugationsLang'));

    if (verb && lang) {
      verbInputEl!.value = verb;
      await applyVerb(verb, lang, false);
    } else if (lang) {
      navigate(`/conjugations/${lang}`);
    }
  });

  const applyVerb = async (
    verb: string,
    lang: ConjugationLang,
    follow = true
  ) => {
    reset();
    void set('conjugationsLang', lang);

    if (follow) {
      navigate(`/conjugations/${lang}/${verb}`);
    }

    setState('verbLoading', true);

    const conjugations = await fetchConjugationsByTense(verb, lang);

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
    <div class="page-container flex flex-col items-center">
      <h1 class="mb-4 text-xl">Insert verb to conjugate</h1>
      <div class="flex gap-2">
        <VerbInput
          lang={language()}
          onApplyVerb={applyVerb}
          ref={verbInputEl}
          verbLoading={state.verbLoading}
        />
      </div>
      <div class="mt-8"></div>
      <Show when={!state.testingDone}>
        <Show when={!state.practiceIncorrect}>
          <TenseFilter
            conjugationsByMood={conjugationsByMood()}
            lang={language() as ConjugationLang}
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

export default ConjugationsView;
