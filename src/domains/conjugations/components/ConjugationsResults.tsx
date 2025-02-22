import { For, Show } from 'solid-js';
import type { Component } from 'solid-js';
import type { TensesValidations } from './ConjugationsTester';
import { Button } from '~/components/ui/button';

interface Props {
  tensesValidations: TensesValidations;
  onPracticeIncorrect: () => void;
  onTryAgain: () => void;
  onExit: () => void;
}

export const ConjugationsResults: Component<Props> = props => {
  const someInvalid = () =>
    Object.values(props.tensesValidations)
      .flat()
      .some(cr => cr.valid === false);

  return (
    <div>
      <h2 class="text-center text-2xl font-semibold">Results</h2>
      <div class="flex flex-wrap gap-8">
        <For each={Object.keys(props.tensesValidations)}>
          {tense => (
            <div class="mx-auto mt-6">
              <h3 class="text-center text-lg">{tense}</h3>
              <table class="mt-2 border-separate border-spacing-x-4 border-spacing-y-2">
                <thead class="text-center opacity-80">
                  <tr>
                    <th></th>
                    <th>Correct</th>
                    <th>Yours</th>
                  </tr>
                </thead>
                <tbody>
                  <For each={props.tensesValidations[tense]}>
                    {tenseValidation => (
                      <tr>
                        <td class="border-r border-r-zinc-500 pr-8 text-right">
                          {tenseValidation.form.pronoun}
                        </td>
                        <td class="border-r border-r-zinc-500 pr-8 text-right">
                          {tenseValidation.form.form}
                        </td>
                        <td
                          class="pr-8"
                          classList={{
                            'text-green-600': tenseValidation.valid,
                            'text-red-500': !tenseValidation.valid,
                          }}
                        >
                          {tenseValidation.answer || '-'}
                        </td>
                      </tr>
                    )}
                  </For>
                </tbody>
              </table>
            </div>
          )}
        </For>
      </div>
      <div class="mt-12 flex justify-center gap-2">
        <Button variant="secondary" onClick={props.onTryAgain}>
          Try again
        </Button>
        <Show when={someInvalid()}>
          <Button variant="secondary" onClick={props.onPracticeIncorrect}>
            Practice incorrect
          </Button>{' '}
        </Show>
        <Button onClick={props.onExit}>Leave</Button>
      </div>
    </div>
  );
};
