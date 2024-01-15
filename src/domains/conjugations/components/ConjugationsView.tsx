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
import { ConjugationsTester } from './ConjugationsTester';
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
  const [testingDone, setTestingDone] = createSignal(false);
  const [verbLoading, setVerbLoading] = createSignal(false);

  const conjugationsByTense = () => groupConjugationsByTense(conjugations());
  const conjugationsByMood = () => groupConjugationsByMood(conjugations());

  const selectedConjugations = () =>
    selectedTenses().map(c => ({
      tense: c,
      conjugations: conjugationsByTense()[c],
    }));

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

  const selectTenses = (selectedTenses: string[]) => {
    setSelectedTenses(selectedTenses);

    if (testingDone()) {
      setTestingDone(false);
    }
  };

  const onTestingDone = () => {
    setTestingDone(true);
    setSelectedTenses([]);
  };

  const reset = () => {
    setTestingDone(false);
    setConjugations([]);
    setSelectedTenses([]);
  };

  return (
    <div class="flex flex-col items-center">
      <h2 class="mb-4 text-zinc-300">Insert verb to conjugate</h2>
      <VerbInput
        onApplyVerb={applyVerb}
        ref={verbInputEl}
        verbLoading={verbLoading()}
      />
      <div class="mt-8"></div>
      <TenseFilter
        conjugationsByMood={conjugationsByMood()}
        lang={lang()}
        selectedMoods={selectedMoods()}
        selectedTenses={selectedTenses()}
        onSelectedMoods={setSelectedMoods}
        onSelectedTenses={selectTenses}
      />
      <div class="mt-8"></div>
      <Show when={!testingDone()}>
        <ConjugationsTester
          conjugations={selectedConjugations()}
          onDone={onTestingDone}
        />
      </Show>
      <Show when={testingDone()}>
        Done!
        {/* TODO: Results */}
      </Show>
    </div>
  );
};
