import { Component, For, Show, createSignal } from 'solid-js';
import { createStore } from 'solid-js/store';
import { WriteTester } from '../../vocabulary/WriteTester';
import { Conjugation, ConjugationByTense } from '../conjugation';

interface Props {
  conjugations: ConjugationByTense[];
  onDone(): void;
}

interface ConjugationValidations {
  [tense: string]: { conjugation: Conjugation; valid: boolean }[] | undefined;
}

export const ConjugationsTester: Component<Props> = props => {
  const [currentConjugationIndex, setCurrentConjugationIndex] = createSignal(0);
  const [conjugationValidations, setConjugationValidations] =
    createStore<ConjugationValidations>({});

  const currentConjugation = () =>
    props.conjugations.at(currentConjugationIndex());

  const isLastConjugation = () =>
    currentConjugationIndex() === props.conjugations.length - 1;

  const conjugationInvalid = (c: Conjugation) =>
    conjugationValidations[c.tense]?.some(
      cc => cc.conjugation.person === c.person && cc.valid === false
    );

  const onFirstWriteTesterRendered = (ref: HTMLInputElement) => {
    ref.focus();
  };

  const onValidated = (conjugation: Conjugation, valid: boolean) => {
    const currentTense = conjugation.tense;

    if (!conjugationValidations[currentTense]) {
      setConjugationValidations(currentTense, []);
    }

    const alreadyValidated = conjugationValidations[currentTense]?.some(
      c => c.conjugation.person === conjugation.person
    );

    // Only first try is taken into account. That's because I want the user to practice
    // the conjugations he/she got wrong.
    if (!alreadyValidated) {
      setConjugationValidations(currentTense, cjs =>
        cjs!.concat([{ conjugation, valid }])
      );
    }
  };

  const nextOrFinish = () => {
    if (isLastConjugation()) {
      return props.onDone();
    }
    setCurrentConjugationIndex(i => i + 1);
  };

  return (
    <Show when={currentConjugation()}>
      {conjugation => (
        <div>
          <h2 class="text-lg">{conjugation().tense}</h2>
          <table class="border-separate border-spacing-y-8">
            <tbody>
              <For each={conjugation().conjugations}>
                {(c, i) => (
                  <tr>
                    <th class="text-right font-normal">
                      <span class="mr-2">{c.person}</span>
                    </th>
                    <td>
                      <WriteTester
                        translation={c.conjugatedVerb}
                        peek={conjugationInvalid(c)}
                        onReady={
                          i() === 0 ? onFirstWriteTesterRendered : undefined
                        }
                        strict={true}
                        validateOnBlur={true}
                        onValidated={valid => onValidated(c, valid)}
                      />
                    </td>
                  </tr>
                )}
              </For>
            </tbody>
          </table>

          <button
            class="btn-primary block mr-8 ml-auto"
            type="button"
            onClick={nextOrFinish}
          >
            {isLastConjugation() ? 'Finish' : 'Next'}
          </button>
        </div>
      )}
    </Show>
  );
};
