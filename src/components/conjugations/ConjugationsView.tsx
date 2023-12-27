import { Component, createSignal } from 'solid-js';
import { Chips } from './Chips';
import { VerbInput } from './VerbInput';

export const ConjugationsView: Component = () => {
  const [selectedCategories, setSelectedCategories] = createSignal<string[]>(
    []
  );

  const applyVerb = async (verb: string) => {
    const res = await fetch(
      `https://daelmaak.pythonanywhere.com/api/conjugations?verb=${verb}`
    );

    const conjugations = await res.json();

    const categories: string[] = [];

    for (const conjugation of conjugations) {
      const category = conjugation[1];

      if (categories.includes(category)) {
        continue;
      }
      categories.push(category);
    }

    setSelectedCategories(categories);

    console.log(categories);
  };

  return (
    <div>
      <VerbInput onApplyVerb={applyVerb} />
      <div class="mt-8"></div>
      <Chips
        chips={selectedCategories()}
        onChipsSelected={() => {}} // TODO
      />
    </div>
  );
};
