import { A } from '@solidjs/router';
import {
  HiOutlinePlus,
  HiOutlineAcademicCap,
  HiOutlineTrash,
} from 'solid-icons/hi';
import type { Component } from 'solid-js';
import { createSignal, Show } from 'solid-js';
import { BackLink } from '~/components/BackLink';
import { CountrySelect } from '~/components/country-select/country-select';
import { VocabularyResultsMini } from '~/domains/vocabulary-results/components/VocabularyResultsMini';
import type { Vocabulary } from '../model/vocabulary-model';
import {
  createWords,
  updateVocabulary,
} from '../resources/vocabulary-resource';
import { Label } from '~/components/ui/label';
import { Input } from '~/components/ui/input';
import { Button } from '~/components/ui/button';
import type { TestResult } from '~/domains/vocabulary-results/model/test-result-model';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '~/components/ui/sheet';
import { WordsAdder } from './WordsAdder';
import type { WordTranslation } from '~/model/word-translation';
import { ConfirmationDialog } from '~/components/ConfirmationDialog';
import { testResultsRoute, testRoute } from '~/routes/routes';

interface Props {
  vocabulary: Vocabulary;
  testProgress?: TestResult | null;
  lastTestResult?: TestResult | null;
  onDeleteVocabulary: (id: number) => void;
  onTestVocabulary: (testId?: number) => void;
}

export const VocabularySummary: Component<Props> = props => {
  const [openedAddWords, setOpenedAddWords] = createSignal(false);
  const [creatingWords, setCreatingWords] = createSignal(false);

  async function onCreateWords(words: WordTranslation[]) {
    setCreatingWords(true);
    await createWords(props.vocabulary.id, ...words);
    setOpenedAddWords(false);
    setCreatingWords(false);
  }

  async function onVocabularyDataChange(event: Event) {
    const form = (event.target as Element).closest('form') as HTMLFormElement;
    const name = form.vocabularyName.value;
    const country = form.country.value;

    const vocabulary = props.vocabulary;

    if (!name || !country) {
      return;
    }

    if (vocabulary.name === name && vocabulary.country === country) {
      return;
    }

    await updateVocabulary({
      id: vocabulary.id,
      name,
      country,
    });
  }

  return (
    <div class="flex h-full flex-col gap-4">
      <Sheet open={openedAddWords()} onOpenChange={setOpenedAddWords}>
        <SheetContent
          class="flex w-svw flex-col gap-4 sm:w-[30rem]"
          onPointerDownOutside={e => e.preventDefault()}
        >
          <SheetHeader>
            <SheetTitle>Add words</SheetTitle>
          </SheetHeader>

          <WordsAdder
            creatingWords={creatingWords()}
            onCreateWords={onCreateWords}
          />
        </SheetContent>
      </Sheet>

      <BackLink class="mb-4">Back to vocabularies</BackLink>
      <Show when={props.vocabulary}>
        {v => (
          <form onFocusOut={onVocabularyDataChange} autocomplete="off">
            <Label for="vocabulary-name">Vocabulary name</Label>
            <Input
              id="vocabulary-name"
              name="vocabularyName"
              value={v().name}
            />
            <div class="mt-4"></div>
            <Label for="country">Language</Label>
            <CountrySelect id="country" defaultValue={v().country} />
          </form>
        )}
      </Show>

      <div class="mt-8 flex flex-col gap-4">
        <Button class="grow" size="sm" onClick={() => setOpenedAddWords(true)}>
          <HiOutlinePlus size={16} /> Add words
        </Button>
        <div class="flex flex-wrap gap-4">
          <Button
            class="grow"
            size="sm"
            variant={props.testProgress ? 'secondary' : 'defaultOutline'}
            onClick={() => props.onTestVocabulary()}
          >
            <HiOutlineAcademicCap />
            Test all
          </Button>
          <Show when={props.testProgress}>
            {testProgress => (
              <Button
                class="grow"
                size="sm"
                variant="defaultOutline"
                onClick={() => props.onTestVocabulary(testProgress().id)}
              >
                <HiOutlineAcademicCap />
                Continue test
              </Button>
            )}
          </Show>
        </div>
      </div>

      <Show when={props.testProgress}>
        {progress => (
          <A href={testRoute(props.vocabulary.id, progress().id)}>
            <VocabularyResultsMini result={progress()} />
          </A>
        )}
      </Show>

      <Show when={props.lastTestResult}>
        {result => (
          <A href={testResultsRoute(props.vocabulary.id, result().id)}>
            <VocabularyResultsMini result={result()} />
          </A>
        )}
      </Show>

      <ConfirmationDialog
        confirmText="Delete vocabulary"
        onConfirm={() => props.onDeleteVocabulary?.(props.vocabulary.id)}
        trigger={p => (
          <Button
            {...p}
            class="mt-auto w-full"
            size="sm"
            variant="destructiveOutline"
          >
            <HiOutlineTrash />
            Delete vocabulary
          </Button>
        )}
      />
    </div>
  );
};
