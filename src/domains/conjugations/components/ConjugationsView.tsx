import { Component, Show, createSignal } from 'solid-js';
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
  const [conjugations, setConjugations] = createSignal<Conjugation[]>([]);
  const [selectedCategories, setSelectedCategories] = createSignal<string[]>(
    []
  );
  const [testingDone, setTestingDone] = createSignal(false);

  const conjugationsByTense = () => groupConjugationsByTense(conjugations());
  const conjugationsByMood = () => groupConjugationsByMood(conjugations());

  const selectedConjugations = () =>
    selectedCategories().map(c => ({
      tense: c,
      conjugations: conjugationsByTense()[c],
    }));

  const applyVerb = async (verb: string) => {
    const conjugations = await fetchConjugationsByTense(verb);
    setConjugations(conjugations);
  };

  const selectCategories = (selectedCategories: string[]) => {
    setSelectedCategories(selectedCategories);

    if (testingDone()) {
      setTestingDone(false);
    }
  };

  const onTestingDone = () => {
    setTestingDone(true);
    setSelectedCategories([]);
  };

  return (
    <div class="flex flex-col items-center">
      <VerbInput onApplyVerb={applyVerb} />
      <div class="mt-8"></div>
      <TenseFilter
        conjugationsByMood={conjugationsByMood()}
        lang={'pt'}
        selectedTenses={selectedCategories()}
        onChange={selectCategories}
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
