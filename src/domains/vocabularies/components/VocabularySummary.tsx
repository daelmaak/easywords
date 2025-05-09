import { A } from '@solidjs/router';
import {
  HiOutlinePlus,
  HiOutlineAcademicCap,
  HiOutlineArchiveBox,
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
  wordCount?: number;
  testProgress?: TestResult | null;
  lastTestResult?: TestResult | null;
  onArchiveVocabulary: (archive: boolean) => void;
  onDeleteResult: (id: number) => void;
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
    const name = form.querySelector('#vocabulary-name')?.textContent;
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
    <div class="flex min-h-full flex-col gap-2">
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

      <BackLink class="mb-2 sm:mb-4">Back to vocabularies</BackLink>
      <Show when={props.vocabulary}>
        {v => (
          <>
            <form
              class="flex flex-col gap-2"
              onFocusOut={onVocabularyDataChange}
              autocomplete="off"
            >
              <Show when={v().archived}>
                <span class="text-sm text-muted-foreground">(Archived)</span>
              </Show>
              <span
                id="vocabulary-name"
                class="border-none px-1 text-lg font-semibold"
                contentEditable
                role="textbox"
              >
                {v().name}
              </span>
              <CountrySelect id="country" defaultValue={v().country} />
            </form>
            <span class="ml-1 mt-1 text-sm">
              <strong>{props.wordCount}</strong> words
            </span>
          </>
        )}
      </Show>

      <div class="mb-4 mt-4 flex flex-col gap-2 sm:gap-4">
        <Button class="grow" size="sm" onClick={() => setOpenedAddWords(true)}>
          <HiOutlinePlus size={16} /> Add words
        </Button>
        <div class="flex flex-wrap gap-4">
          <Button
            class="grow"
            size="sm"
            variant="defaultOutline"
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
            <VocabularyResultsMini
              result={progress()}
              onDelete={() => props.onDeleteResult(progress().id)}
            />
          </A>
        )}
      </Show>

      <Show when={props.lastTestResult}>
        {result => (
          <A href={testResultsRoute(props.vocabulary.id, result().id)}>
            <VocabularyResultsMini
              result={result()}
              onDelete={() => props.onDeleteResult(result().id)}
            />
          </A>
        )}
      </Show>

      <div class="mt-auto flex flex-col gap-4">
        <Show when={!props.vocabulary.archived}>
          <ConfirmationDialog
            headingText="Archive vocabulary"
            confirmText="Archive"
            content={
              <p>
                You can safely archive and later unarchive the vocabulary. It
                won't be deleted by this operation.
              </p>
            }
            onConfirm={() => props.onArchiveVocabulary?.(true)}
            trigger={p => (
              <Button {...p} size="sm" variant="destructiveOutline">
                <HiOutlineArchiveBox />
                Archive vocabulary
              </Button>
            )}
          />
        </Show>

        <Show when={props.vocabulary.archived}>
          <Button
            size="sm"
            variant="outline"
            onClick={() => props.onArchiveVocabulary?.(false)}
          >
            Unarchive vocabulary
          </Button>

          <ConfirmationDialog
            content={
              <p>
                Are you sure you want to delete this vocabulary? This operation
                cannot be undone.
              </p>
            }
            confirmText="Delete vocabulary"
            onConfirm={() => props.onDeleteVocabulary?.(props.vocabulary.id)}
            trigger={p => (
              <Button
                {...p}
                class="mt-auto w-full"
                size="sm"
                variant="destructive"
              >
                <HiOutlineArchiveBox />
                Delete vocabulary
              </Button>
            )}
          />
        </Show>
      </div>
    </div>
  );
};
