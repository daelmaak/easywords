import { cleanup, render, screen } from '@solidjs/testing-library';
import { afterEach, assert, expect, it, vi } from 'vitest';
import { VocabularyCreator } from './VocabularyCreator';
import { VocabularyToCreate } from '../resources/vocabulary-api';
import userEvent from '@testing-library/user-event';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

it('should send complete form information on submit', async () => {
  const { onListCreateSpy, userInteraction } = setup();

  const markup = render(() => (
    <VocabularyCreator onListCreate={onListCreateSpy} />
  ));

  const vocabularyName = markup.container.querySelector('#vocabulary-name');
  const country = markup.container.querySelector('[name=country]');

  assert(vocabularyName);
  assert(country);

  await userInteraction.type(vocabularyName, 'My vocabulary');
  await userInteraction.selectOptions(country, ['cz']);

  const submitBtn = screen.getByTestId('creator-form-submit');
  await userInteraction.click(submitBtn);

  expect(onListCreateSpy).toHaveBeenCalledWith({
    country: 'cz',
    name: 'My vocabulary',
    vocabularyItems: [],
  } as VocabularyToCreate);
});

function setup() {
  const onListCreateSpy = vi.fn();

  const userInteraction = userEvent.setup();

  return {
    onListCreateSpy,
    userInteraction,
  };
}
