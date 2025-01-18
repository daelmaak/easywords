import type { Component } from 'solid-js';
import { createSignal, For, Show } from 'solid-js';
import { createStore } from 'solid-js/store';
import type { WriteTesterInstance } from '~/domains/vocabulary-testing/components/WriteTester';
import { WriteTester } from '~/domains/vocabulary-testing/components/WriteTester';
import { Button } from '~/components/ui/button';
import type { Tense, TenseForm } from '../resources/conjugations-api';

interface Props {
  selectedTenses: Tense[];
  onDone(validationResults: TensesValidations): void;
}

export interface TensesValidations {
  [tense: string]: {
    form: TenseForm;
    answer: string;
    valid: boolean;
  }[];
}

export const ConjugationsTester: Component<Props> = props => {
  const [currentConjugationIndex, setCurrentConjugationIndex] = createSignal(0);
  const [tenseValidations, setConjugationValidations] =
    createStore<TensesValidations>({});
  let validators: Array<() => boolean> = [];

  const onTesterReady = (index: number) => (tester: WriteTesterInstance) => {
    if (index === 0) {
      tester.input.focus();
    }
    validators.push(tester.validate);
  };

  const currentTense = () => props.selectedTenses.at(currentConjugationIndex());

  const isLastConjugation = () =>
    currentConjugationIndex() === props.selectedTenses.length - 1;

  const conjugationInvalid = (tense: Tense, form: TenseForm) =>
    tenseValidations[tense.name]?.some(
      v => v.form.pronoun === form.pronoun && v.valid === false
    );

  const onValidated = (
    tense: Tense,
    form: TenseForm,
    valid: boolean,
    answer: string
  ) => {
    if (!tenseValidations[tense.name]) {
      setConjugationValidations(tense.name, []);
    }

    const alreadyValidated = tenseValidations[tense.name]?.some(
      v => v.form.pronoun === form.pronoun
    );

    // Only first try is taken into account. That's because I want the user to practice
    // the conjugations he/she got wrong.
    if (!alreadyValidated) {
      setConjugationValidations(tense.name, cjs =>
        cjs!.concat([{ form, valid, answer }])
      );
    }
  };

  const nextOrFinish = () => {
    validators.forEach(v => v());
    validators = []; // Validators need to be reset for the next conjugations

    if (isLastConjugation()) {
      return props.onDone(tenseValidations);
    }
    setCurrentConjugationIndex(i => i + 1);
  };

  return (
    <Show when={currentTense()}>
      {tense => (
        <div>
          <h2 class="text-lg">{tense().name}</h2>
          <div class="mt-6 grid items-center justify-start gap-x-4 gap-y-6 lg:grid-flow-col lg:grid-rows-3">
            <For each={tense().forms}>
              {(form, i) => (
                <div class="flex items-center gap-4">
                  <span class="w-12 break-words text-right sm:w-16">
                    {form.pronoun}
                  </span>
                  <div class="w-64">
                    <WriteTester
                      word={{ translation: form.form }}
                      mode="inline"
                      peek={conjugationInvalid(tense(), form)}
                      onReady={onTesterReady(i())}
                      strict={true}
                      validateOnBlur={true}
                      onValidated={(valid, answer) =>
                        onValidated(tense(), form, valid, answer)
                      }
                    />
                  </div>
                </div>
              )}
            </For>
          </div>
          <Button
            class="ml-auto mt-4 block"
            type="button"
            onClick={nextOrFinish}
          >
            {isLastConjugation() ? 'Finish' : 'Next'}
          </Button>
        </div>
      )}
    </Show>
  );
};
