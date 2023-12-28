import { Component, For, Show, createSignal } from 'solid-js';
import { createStore } from 'solid-js/store';
import { Conjugation, ConjugationByTense } from '../../models/conjugation';
import { WriteTester } from '../vocabulary/WriteTester';

interface Props {
  conjugations: ConjugationByTense[];
}

export const ConjugationsTester: Component<Props> = props => {
  const [_currentConjugation, setCurrentConjugation] =
    createSignal<ConjugationByTense>();
  const [invalidConjugations, setInvalidConjugations] = createStore<
    ConjugationByTense[]
  >([]);

  const currentConjugation = () =>
    _currentConjugation() ?? props.conjugations[0];

  const isLastConjugation = () =>
    currentConjugation().tense === props.conjugations.at(-1)?.tense;

  const onValidated = (conjugation: Conjugation, valid: boolean) => {
    if (valid) {
      return;
    }

    const currentTense = currentConjugation().tense;
    const invalidConjugationExists = invalidConjugations.every(
      ic => ic.tense !== currentTense
    );

    if (invalidConjugationExists) {
      setInvalidConjugations([
        ...invalidConjugations,
        { tense: currentTense, conjugations: [] },
      ]);
    }

    setInvalidConjugations(
      invalidConjugation =>
        invalidConjugation.tense === currentConjugation().tense,
      'conjugations',
      conjugations => conjugations.concat([conjugation])
    );
  };

  const conjugationInvalid = (c: Conjugation) =>
    invalidConjugations
      .find(ic => ic.tense === currentConjugation().tense)
      ?.conjugations.some(cc => cc.conjugatedVerb === c.conjugatedVerb);

  return (
    <Show keyed={true} when={currentConjugation()}>
      {conjugation => (
        <div>
          <h2>{conjugation.tense}</h2>
          <For each={conjugation.conjugations}>
            {c => (
              <div class="mt-8 flex gap-2">
                <span>{c.person}</span>
                <WriteTester
                  translation={c.conjugatedVerb}
                  peek={conjugationInvalid(c)}
                  onValidated={valid => onValidated(c, valid)}
                />
              </div>
            )}
          </For>
          <button class="btn-primary" type="button">
            {isLastConjugation() ? 'Finish' : 'Next'}
          </button>
        </div>
      )}
    </Show>
  );
};
