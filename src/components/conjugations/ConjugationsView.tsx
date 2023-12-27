import { Component, createSignal } from 'solid-js';
import { fetchConjugationsByTense } from '../../api/conjugations-api';
import { ConjugationsByTense } from '../../models/conjugation';
import { Chips } from './Chips';
import { ConjugationsTester } from './ConjugationsTester';
import { VerbInput } from './VerbInput';

export const ConjugationsView: Component = () => {
  const [conjugations, setConjugations] = createSignal<ConjugationsByTense>({});
  const [selectedCategories, setSelectedCategories] = createSignal<string[]>(
    []
  );

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

  return (
    <div>
      <VerbInput onApplyVerb={applyVerb} />
      <div class="mt-8"></div>
      <Chips chips={categories()} onChipsSelected={setSelectedCategories} />
      <ConjugationsTester conjugations={selectedConjugations()} />
    </div>
  );
};
