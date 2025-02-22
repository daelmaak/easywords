import { For, type Component } from 'solid-js';
import type { Tense, VerbConjugations } from '../resources/conjugations-api';
import { groupedTenses } from '../util/tenses-grouping-util';

type Props = {
  verb: string;
  verbConjugations: VerbConjugations;
};

export const ConjugationsTensesView: Component<Props> = props => {
  const tenses = () =>
    Array.from(groupedTenses(props.verbConjugations.tenses).entries());

  const tenseName = (tense: Tense) =>
    tense.name.split(' ').slice(1).join(' ') || tense.name;

  return (
    <main class="flex w-full max-w-6xl flex-col gap-8 px-8">
      <For each={tenses()}>
        {([tenseGroupName, tenses]) => (
          <div class="mb-4 flex w-full flex-col gap-4">
            <h2 class="text-2xl font-thin">{tenseGroupName}</h2>
            <div class="grid gap-x-16 gap-y-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              <For each={tenses}>
                {tense => (
                  <div>
                    <h3 class="text-lg font-extrabold text-pink-600">
                      {tenseName(tense)}
                    </h3>
                    <dl class="grid grid-cols-[auto_1fr] gap-x-4 text-sm">
                      <For each={tense.forms}>
                        {form => (
                          <>
                            <dt class="text-right">{form.pronoun}</dt>
                            <dd class="font-bold">{form.form}</dd>
                          </>
                        )}
                      </For>
                    </dl>
                  </div>
                )}
              </For>
            </div>
          </div>
        )}
      </For>
    </main>
  );
};
