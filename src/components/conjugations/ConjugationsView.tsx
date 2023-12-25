import { Component } from 'solid-js';
import { VerbInput } from './VerbInput';

export const ConjugationsView: Component = () => {
  const applyVerb = async (verb: string) => {
    const res = await fetch(
      `https://daelmaak.pythonanywhere.com/api/conjugations?verb=${verb}`
    );

    const conjugations = await res.json();

    console.log(conjugations);
  };

  return (
    <div>
      <VerbInput onApplyVerb={applyVerb} />
    </div>
  );
};
