import { useNavigate, useParams, useSearchParams } from '@solidjs/router';
import { Component, Show, createSignal, onMount, useContext } from 'solid-js';
import { LangContext } from '../../../components/language-context';
import { navigateTo } from '../../../util/routing';
import {
  Conjugation,
  groupConjugationsByMood,
  groupConjugationsByTense,
} from '../conjugation';
import { fetchConjugationsByTense } from '../conjugations-api';
import { ConjugationsTester } from './ConjugationsTester';
import { TenseFilter } from './TenseFilter';
import { VerbInput } from './VerbInput';

export const ConjugationsView: Component = () => {
  const params = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  let verbInputEl: HTMLInputElement | undefined;

  const lang = useContext(LangContext);
  const [conjugations, setConjugations] = createSignal<Conjugation[]>([]);
  const [selectedCategories, setSelectedCategories] = createSignal<string[]>(
    []
  );
  const [testingDone, setTestingDone] = createSignal(false);

  const conjugationsByTense = () => groupConjugationsByTense(conjugations());
  const conjugationsByMood = () => groupConjugationsByMood(conjugations());

  const selectedConjugations = () =>
    selectedCategories().map(c => ({
      tense: c,
      conjugations: conjugationsByTense()[c],
    }));

  onMount(() => {
    const verb = params.verb;

    if (verb) {
      applyVerb(verb, false);
      verbInputEl!.value = verb;
    }
  });

  const applyVerb = async (verb: string, follow = true) => {
    if (follow) {
      navigateTo(`/conjugations/${verb}`, { navigate, searchParams });
    }

    const conjugations = await fetchConjugationsByTense(verb, lang());
    setConjugations(conjugations);
  };

  const selectCategories = (selectedCategories: string[]) => {
    setSelectedCategories(selectedCategories);

    if (testingDone()) {
      setTestingDone(false);
    }
  };

  const onTestingDone = () => {
    setTestingDone(true);
    setSelectedCategories([]);
  };

  return (
    <div class="flex flex-col items-center">
      <VerbInput onApplyVerb={applyVerb} ref={verbInputEl} />
      <div class="mt-8"></div>
      <TenseFilter
        conjugationsByMood={conjugationsByMood()}
        lang={lang()}
        selectedTenses={selectedCategories()}
        onChange={selectCategories}
      />
      <div class="mt-8"></div>
      <Show when={!testingDone()}>
        <ConjugationsTester
          conjugations={selectedConjugations()}
          onDone={onTestingDone}
        />
      </Show>
      <Show when={testingDone()}>
        Done!
        {/* TODO: Results */}
      </Show>
    </div>
  );
};
