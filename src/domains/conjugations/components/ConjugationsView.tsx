import { useNavigate, useParams, useSearchParams } from '@solidjs/router';
import { Component, Show, createSignal, onMount, useContext } from 'solid-js';
import { LangContext } from '../../../components/language-context';
import { navigateTo } from '../../../util/routing';
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
import { TenseFilter } from './TenseFilter';
import { VerbInput } from './VerbInput';

export const ConjugationsView: Component = () => {
  const params = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  let verbInputEl: HTMLInputElement | undefined;

  const lang = useContext(LangContext);
  const [conjugations, setConjugations] = createSignal<Conjugation[]>([]);
  const [selectedMoods, setSelectedMoods] = createSignal<string[]>([]);
  const [selectedTenses, setSelectedTenses] = createSignal<string[]>([]);
  const [conjugationsResults, setConjugationsResults] =
    createSignal<ConjugationValidations>({});
  const [practiceIncorrect, setPracticeIncorrect] = createSignal(false);
  const [testingDone, setTestingDone] = createSignal(false);
  const [verbLoading, setVerbLoading] = createSignal(false);

  const incorrectConjugations = () =>
    Object.values(conjugationsResults())
      .flat()
      .filter(c => !c.valid)
      .map(c => c.conjugation);

  const conjugationsByMood = () => groupConjugationsByMood(conjugations());

  const selectedConjugations = () => {
    const conjugationsByTense = groupConjugationsByTense(
      practiceIncorrect() ? incorrectConjugations() : conjugations()
    );

    return selectedTenses().map(c => ({
      tense: c,
      conjugations: conjugationsByTense[c],
    }));
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
      navigateTo(`/conjugations/${verb}`, { navigate, searchParams });
    }

    setVerbLoading(true);

    const conjugations = await fetchConjugationsByTense(verb, lang());
    setConjugations(conjugations);
    setVerbLoading(false);
  };

  const reset = () => {
    setConjugations([]);
    setConjugationsResults({});
    setSelectedMoods([]);
    setSelectedTenses([]);
    setTestingDone(false);
  };

  const selectTenses = (selectedTenses: string[]) => {
    setSelectedTenses(selectedTenses);

    if (testingDone()) {
      setTestingDone(false);
    }
  };

  const onTestingDone = (validationResults: ConjugationValidations) => {
    setTestingDone(true);
    setConjugationsResults(validationResults);
  };

  const onTryAgain = () => {
    setConjugationsResults({});
    setTestingDone(false);
    setPracticeIncorrect(false);
  };

  const onTryDifferent = () => {
    setConjugationsResults({});
    setSelectedMoods([]);
    setSelectedTenses([]);
    setTestingDone(false);
    setPracticeIncorrect(false);
  };

  const onPracticeIncorrect = () => {
    setPracticeIncorrect(true);
    setTestingDone(false);
  };

  return (
    <div class="flex flex-col items-center">
      <h2 class="mb-4">Insert verb to conjugate</h2>
      <VerbInput
        onApplyVerb={applyVerb}
        ref={verbInputEl}
        verbLoading={verbLoading()}
      />
      <div class="mt-8"></div>
      <Show when={!testingDone()}>
        <Show when={!practiceIncorrect()}>
          <TenseFilter
            conjugationsByMood={conjugationsByMood()}
            lang={lang()}
            selectedMoods={selectedMoods()}
            selectedTenses={selectedTenses()}
            onSelectedMoods={setSelectedMoods}
            onSelectedTenses={selectTenses}
          />
        </Show>
        <div class="mt-8"></div>
        <ConjugationsTester
          conjugations={selectedConjugations()}
          onDone={onTestingDone}
        />
      </Show>
      <Show when={testingDone()}>
        <>
          <hr class="w-3/4 mt-6 mb-12 border-zinc-500" />
          <ConjugationsResults
            conjugationsResults={conjugationsResults()}
            onTryAgain={onTryAgain}
            onTryDifferent={onTryDifferent}
            onPracticeIncorrect={onPracticeIncorrect}
          />
        </>
      </Show>
    </div>
  );
};
