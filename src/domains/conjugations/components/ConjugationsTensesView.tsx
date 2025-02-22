import { For, Show, type Component } from 'solid-js';
import type { Tense, VerbConjugations } from '../resources/conjugations-api';
import { groupedTenses } from '../util/tenses-grouping-util';
import { Checkbox } from '~/components/ui/checkbox';
import { Button } from '~/components/ui/button';
import { HiOutlineAcademicCap } from 'solid-icons/hi';

type Props = {
  verb: string;
  verbConjugations: VerbConjugations;
  selectedTenses: Tense[];
  onTenseSelected: (tenses: Tense, selected: boolean) => void;
  onTest: () => void;
};

export const ConjugationsTensesView: Component<Props> = props => {
  const tenses = () =>
    Array.from(groupedTenses(props.verbConjugations.tenses).entries());

  const tenseName = (tense: Tense) =>
    tense.name.split(' ').slice(1).join(' ') || tense.name;

  return (
    <div class="mx-auto flex w-full max-w-6xl flex-col gap-8">
      <div class="flex items-center gap-8">
        <h1 class="text-3xl font-bold text-pink-600">{props.verb}</h1>
        <Show when={props.selectedTenses.length > 0}>
          <Button onClick={props.onTest} size="sm">
            <HiOutlineAcademicCap /> Test
          </Button>
        </Show>
      </div>
      <For each={tenses()}>
        {([tenseGroupName, tenses]) => (
          <div class="mb-4 flex w-full flex-col gap-4">
            <h2 class="text-2xl font-thin">{tenseGroupName}</h2>
            <div class="grid gap-x-16 gap-y-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              <For each={tenses}>
                {tense => (
                  <div>
                    <div class="flex items-center">
                      <h3 class="text-lg font-extrabold text-pink-600">
                        {tenseName(tense)}
                      </h3>
                      <Checkbox
                        class="ml-4"
                        onChange={checked =>
                          props.onTenseSelected(tense, checked)
                        }
                      />
                    </div>
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
    </div>
  );
};
