import { useNavigate } from '@solidjs/router';
import { Show } from 'solid-js';
import { getVocabulariesResource } from '~/domains/vocabularies/resources/vocabulary-resources';
import { isLoggedIn, sessionResource } from '../auth/auth-resource';
import { VocabularyOverview } from './components/VocabularyOverview';

export const VocabulariesPage = () => {
  const navigate = useNavigate();

  const [session] = sessionResource;
  const loggedIn = () => isLoggedIn(session());

  function onTestVocabulary(id: number) {
    navigate(`/vocabulary/${id}/test`);
  }

  return (
    <>
      <Show when={loggedIn()}>
        <VocabularyOverview
          vocabulariesResource={getVocabulariesResource()}
          onTestVocabulary={onTestVocabulary}
        />
      </Show>
      <Show when={loggedIn() === false}>
        <div>Not logged in</div>
      </Show>
    </>
  );
};
