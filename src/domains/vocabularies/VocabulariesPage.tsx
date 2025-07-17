import { useNavigate, useSearchParams } from '@solidjs/router';
import { HiOutlinePlus } from 'solid-icons/hi';
import { createSignal, For, Show, Suspense } from 'solid-js';
import { Button } from '~/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '~/components/ui/sheet';
import { VocabularyCard } from './components/VocabularyCard';
import { VocabularyCreator } from './components/VocabularyCreator';
import type { VocabularyToCreate } from './resources/vocabulary-resource';
import { createVocabulary } from './resources/vocabulary-resource';
import { navigateToVocabularyTest } from '../vocabulary-testing/util/navigation';
import { createQuery } from '@tanstack/solid-query';
import {
  fetchVocabularies,
  VOCABULARIES_QUERY_KEY,
} from './resources/vocabularies-resource';
import { Routes } from '~/routes/routes';
import type { Vocabulary } from './model/vocabulary-model';
import { Checkbox } from '~/components/ui/checkbox';
import { CountrySelect } from '~/components/country-select/country-select';
import type { CountryCode } from '~/components/country-select/countries';

export const VocabulariesPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [createVocabularyOpen, setCreateVocabularyOpen] = createSignal(
    searchParams.openVocabCreator != null
  );
  const [showArchived, setShowArchived] = createSignal(false);

  const selectedCountry = () => searchParams.country as CountryCode | undefined;

  const vocabulariesQuery = createQuery(() => ({
    queryKey: [VOCABULARIES_QUERY_KEY, { includeArchived: showArchived() }],
    queryFn: () => fetchVocabularies(showArchived()),
  }));

  const availableCountries = () => {
    const countries = new Set<CountryCode>();
    vocabulariesQuery.data?.forEach(vocab => {
      if (vocab.country) {
        countries.add(vocab.country);
      }
    });
    return Array.from(countries).sort();
  };

  const filteredVocabularies = () =>
    vocabulariesQuery.data?.filter(
      vocab => selectedCountry() == null || vocab.country === selectedCountry()
    ) ?? [];

  const anyVocabularies = () => vocabulariesQuery.data?.length ?? 0 > 0;

  const handleCountrySelect = (country: CountryCode | null) => {
    setSearchParams({ ...searchParams, country });
  };

  const vocabulariesByRecency = () => {
    return filteredVocabularies().toSorted((a, b) => {
      if (a.archived !== b.archived) {
        return a.archived ? -1 : 1;
      }
      return (b.updatedAt?.getTime() ?? 0) - (a.updatedAt?.getTime() ?? 0);
    });
  };

  async function onCreateVocabulary(vocabulary: VocabularyToCreate) {
    const success = await createVocabulary(vocabulary);

    if (success) {
      setCreateVocabularyOpen(false);
    }

    return success;
  }

  function onGoToVocabulary(id: number) {
    navigate(`${Routes.Vocabularies}/${id}`);
  }

  function onTestVocabulary(vocabulary: Vocabulary, testId?: number) {
    navigateToVocabularyTest(vocabulary.id, navigate, {
      testId,
    });
  }

  return (
    <main class="min-h-full bg-gray-100">
      <div class="page-container flex flex-wrap items-center justify-between gap-x-4">
        <h1 class="text-lg font-semibold">Your vocabularies</h1>
        <div class="flex flex-wrap items-center gap-4">
          <Checkbox
            class="text-sm"
            label="Show archived"
            checked={showArchived()}
            onChange={setShowArchived}
          />
          <div class="w-16 sm:w-48">
            <CountrySelect
              placeholder="Filter by country"
              onSelect={handleCountrySelect}
              availableCountries={availableCountries()}
              defaultValue={selectedCountry()}
            />
          </div>
          <Button size="sm" onClick={() => setCreateVocabularyOpen(true)}>
            <HiOutlinePlus size={16} /> Add vocabulary
          </Button>
        </div>
        <Sheet
          open={createVocabularyOpen()}
          onOpenChange={open => setCreateVocabularyOpen(open)}
        >
          <SheetContent
            class="w-svw sm:w-[30rem]"
            onPointerDownOutside={e => e.preventDefault()}
          >
            <SheetHeader>
              <SheetTitle>Create new vocabulary</SheetTitle>
            </SheetHeader>
            <VocabularyCreator onVocabularyCreate={onCreateVocabulary} />
          </SheetContent>
        </Sheet>
      </div>

      <Suspense fallback={<div class="w-full text-center">Loading...</div>}>
        <Show
          when={anyVocabularies()}
          fallback={
            <div
              class="flex h-60 flex-col items-center justify-center gap-4"
              data-testid="empty-vocabulary-list"
            >
              <h2 class="text-xl">Create your first vocabulary!</h2>
              <Button
                onClick={() => setCreateVocabularyOpen(true)}
                type="button"
              >
                <HiOutlinePlus size={16} /> Create
              </Button>
            </div>
          }
        >
          <div class="mt-6 flex flex-col gap-4 px-2 pb-12 sm:grid sm:grid-cols-[repeat(auto-fit,_18rem)] sm:content-start sm:items-start sm:justify-center">
            <For each={vocabulariesByRecency()}>
              {vocabulary => (
                <VocabularyCard
                  wordCount={5}
                  vocabulary={vocabulary}
                  onClick={onGoToVocabulary}
                  onTestVocabulary={onTestVocabulary}
                />
              )}
            </For>
          </div>
        </Show>
      </Suspense>
    </main>
  );
};
