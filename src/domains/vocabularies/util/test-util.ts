import type { Screen } from '@solidjs/testing-library';
import type { UserEvent } from '@testing-library/user-event';
import type { WordTranslation } from '~/model/word-translation';

export async function addWordViaForm(
  screen: Screen,
  userInteraction: UserEvent,
  config: { submit?: boolean; wordTranslation?: WordTranslation } = {}
) {
  const originalInput = screen.getByLabelText('Original*');
  const translationInput = screen.getByLabelText('Translation*');
  await userInteraction.type(
    originalInput,
    config.wordTranslation?.original ?? 'ahoj'
  );
  await userInteraction.type(
    translationInput,
    config.wordTranslation?.translation ?? 'hello'
  );

  if (config.submit) {
    const addWordsBtn = screen.getByText('Add word');
    await userInteraction.click(addWordsBtn);
  }
}
