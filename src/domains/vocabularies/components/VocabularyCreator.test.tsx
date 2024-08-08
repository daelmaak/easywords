import { cleanup, render, screen } from '@solidjs/testing-library';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, it, vi } from 'vitest';
import { VocabularyCreator } from './VocabularyCreator';
import type { VocabularyToCreate } from '../resources/vocabularies-resource';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

it('should permit vocabulary creation even when no words filled out', async () => {
  const { onListCreateSpy, userInteraction } = setup();

  render(() => <VocabularyCreator onListCreate={onListCreateSpy} />);

  const vocabularyNameInput = screen.getByLabelText('Vocabulary name');
  const countrySelect = screen.getByLabelText('Language');

  await userInteraction.type(vocabularyNameInput, 'My vocabulary');
  await userInteraction.selectOptions(countrySelect, ['cz']);

  const submitBtn = screen.getByText('Create');
  await userInteraction.click(submitBtn);

  expect(onListCreateSpy).toHaveBeenCalledWith({
    country: 'cz',
    name: 'My vocabulary',
    vocabularyItems: [],
  } satisfies VocabularyToCreate);
});

function setup() {
  const onListCreateSpy = vi.fn();

  const userInteraction = userEvent.setup();

  return {
    onListCreateSpy,
    userInteraction,
  };
}
