import { Component, Show, createSignal } from 'solid-js';
import { ConjugationsByTense } from '../conjugation';
import { fetchConjugationsByTense } from '../conjugations-api';
import { Chips } from './Chips';
import { ConjugationsTester } from './ConjugationsTester';
import { VerbInput } from './VerbInput';

export const ConjugationsView: Component = () => {
  const [conjugations, setConjugations] = createSignal<ConjugationsByTense>({});
  const [selectedCategories, setSelectedCategories] = createSignal<string[]>(
    []
  );
  const [testingDone, setTestingDone] = createSignal(false);

  const categories = () => Object.keys(conjugations());
  const selectedConjugations = () =>
    selectedCategories().map(c => ({
      tense: c,
      conjugations: conjugations()[c],
    }));

  const applyVerb = async (verb: string) => {
    const conjugationsByTense = await fetchConjugationsByTense(verb);
    setConjugations(conjugationsByTense);
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
      <Chips
        chips={categories()}
        selectedChips={selectedCategories()}
        onChipsSelected={selectCategories}
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
