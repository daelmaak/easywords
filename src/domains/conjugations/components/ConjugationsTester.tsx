import { Component, createSignal, For, Show } from 'solid-js';
import { createStore } from 'solid-js/store';
import { Conjugation, ConjugationByTense } from '../conjugation';
import {
  WriteTesterInstance,
  WriteTester,
} from '~/domains/vocabulary-testing/components/WriteTester';
import { Button } from '~/components/ui/button';

interface Props {
  conjugations: ConjugationByTense[];
  onDone(validationResults: ConjugationValidations): void;
}

export interface ConjugationValidations {
  [tense: string]: {
    conjugation: Conjugation;
    answer: string;
    valid: boolean;
  }[];
}

export const ConjugationsTester: Component<Props> = props => {
  const [currentConjugationIndex, setCurrentConjugationIndex] = createSignal(0);
  const [conjugationValidations, setConjugationValidations] =
    createStore<ConjugationValidations>({});
  let validators: Array<() => boolean> = [];

  const onTesterReady = (index: number) => (tester: WriteTesterInstance) => {
    if (index === 0) {
      tester.input.focus();
    }
    validators.push(tester.validate);
  };

  const currentConjugation = () =>
    props.conjugations.at(currentConjugationIndex());

  const isLastConjugation = () =>
    currentConjugationIndex() === props.conjugations.length - 1;

  const conjugationInvalid = (c: Conjugation) =>
    conjugationValidations[c.tense]?.some(
      cc => cc.conjugation.person === c.person && cc.valid === false
    );

  const onValidated = (
    conjugation: Conjugation,
    valid: boolean,
    answer: string
  ) => {
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
        cjs!.concat([{ conjugation, valid, answer }])
      );
    }
  };

  const nextOrFinish = () => {
    validators.forEach(v => v());
    validators = []; // Validators need to be reset for the next conjugations

    if (isLastConjugation()) {
      return props.onDone(conjugationValidations);
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
                        word={{ translation: c.conjugatedVerb }}
                        mode="inline"
                        peek={conjugationInvalid(c)}
                        onReady={onTesterReady(i())}
                        strict={true}
                        validateOnBlur={true}
                        onValidated={(valid, answer) =>
                          onValidated(c, valid, answer)
                        }
                      />
                    </td>
                  </tr>
                )}
              </For>
            </tbody>
          </table>

          <Button class="block ml-auto" type="button" onClick={nextOrFinish}>
            {isLastConjugation() ? 'Finish' : 'Next'}
          </Button>
        </div>
      )}
    </Show>
  );
};
