import { cleanup, render, screen } from '@solidjs/testing-library';
import { afterEach, expect, it } from 'vitest';
import { initTestApp } from '~/init/test-init';
import { tick } from '~/lib/testing';
import { VocabulariesPage } from './VocabulariesPage';
import { MemoryRouter, Route } from '@solidjs/router';
import userEvent from '@testing-library/user-event';
import type { VocabularyToCreateDB } from './resources/vocabulary-api';
import { addWordViaForm } from './util/test-util';
import { QueryClientProvider } from '@tanstack/solid-query';

afterEach(() => {
  cleanup();
});

it('should render an empty vocabulary overview if none exist', async () => {
  const { queryClient, vocabularyApi } = setup();

  vocabularyApi.fetchVocabularies.mockResolvedValue([]);

  render(() => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <Route path="/" component={VocabulariesPage} />
      </MemoryRouter>
    </QueryClientProvider>
  ));
  await tick();

  expect(screen.getByText('Your vocabularies')).toBeTruthy();

  const emptyScreenWidget = screen.getByTestId('empty-vocabulary-list');
  expect(emptyScreenWidget).toBeTruthy();
});

it('should create vocabulary on form submit', async () => {
  const { queryClient, userAction, vocabularyApi } = setup();

  vocabularyApi.fetchVocabularies.mockResolvedValue([]);

  render(() => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <Route path="/" component={VocabulariesPage} />
      </MemoryRouter>
    </QueryClientProvider>
  ));
  await tick();

  const initCreateVocabularyBtn = screen.getByText('Create');
  await userAction.click(initCreateVocabularyBtn);

  const vocabularyNameInput = screen.getByLabelText('Vocabulary name');
  await userAction.type(vocabularyNameInput, 'New vocabulary');

  const countryCombobox = screen.getByLabelText('Language');
  await userAction.selectOptions(countryCombobox, 'de');

  await addWordViaForm(screen, userAction, { submit: true });

  const createVocabularyBtn = screen.getAllByText('Create')[1];
  await userEvent.click(createVocabularyBtn);

  expect(vocabularyApi.createVocabulary).toHaveBeenCalledWith<
    [VocabularyToCreateDB]
  >({
    name: 'New vocabulary',
    country: 'de',
    vocabulary_items: [
      {
        original: 'ahoj',
        translation: 'hello',
        notes: '',
      },
    ],
  });
});

function setup() {
  const { queryClient, vocabularyApi } = initTestApp();
  const userAction = userEvent.setup();

  return {
    queryClient,
    vocabularyApi,
    userAction,
  };
}
