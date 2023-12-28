import { Component, For, Show, createSignal } from 'solid-js';
import { createStore } from 'solid-js/store';
import { Conjugation, ConjugationByTense } from '../../models/conjugation';
import { WriteTester } from '../vocabulary/WriteTester';

interface Props {
  conjugations: ConjugationByTense[];
}

interface ConjugationValidations {
  [tense: string]: { conjugation: Conjugation; valid: boolean }[];
}

export const ConjugationsTester: Component<Props> = props => {
  const [currentConjugationIndex, setCurrentConjugationIndex] = createSignal(0);

  const [conjugationValidations, setConjugationValidations] =
    createStore<ConjugationValidations>({});

  const currentConjugation = () =>
    props.conjugations[currentConjugationIndex()];

  const isLastConjugation = () =>
    currentConjugationIndex() === props.conjugations.length - 1;

  const conjugationInvalid = (c: Conjugation) =>
    conjugationValidations[currentConjugation().tense]?.some(
      cc => cc.conjugation.person === c.person && cc.valid === false
    );

  const onValidated = (conjugation: Conjugation, valid: boolean) => {
    const currentTense = currentConjugation().tense;

    if (!conjugationValidations[currentTense]) {
      setConjugationValidations(currentTense, []);
    }

    const alreadyValidated = conjugationValidations[currentTense].some(
      c => c.conjugation.person === conjugation.person
    );

    // Only first try is taken into account. That's because I want the user to practice
    // the conjugations he/she got wrong.
    if (!alreadyValidated) {
      setConjugationValidations(currentTense, cjs =>
        cjs.concat([{ conjugation, valid }])
      );
    }
  };

  const conjugationInvalid = (c: Conjugation) =>
    conjugationValidations[currentConjugation().tense]?.some(
      cc => cc.conjugation.person === c.person && cc.valid === false
    );

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
