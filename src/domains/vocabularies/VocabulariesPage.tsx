import { useNavigate } from '@solidjs/router';
import { Show } from 'solid-js';
import { Button } from '~/components/ui/button';
import { AuthDialog } from '../auth/AuthDialog';
import { isLoggedIn, sessionResource } from '../auth/auth-resource';
import { VocabularyOverview } from './components/VocabularyOverview';
import { getVocabulariesResource } from './resources/vocabularies-resource';

export const VocabulariesPage = () => {
  const navigate = useNavigate();

  const [session] = sessionResource;
  const loggedIn = () => isLoggedIn(session());

  function onGoToVocabulary(id: number) {
    navigate(`/vocabulary/${id}`);
  }

  function onTestVocabulary(
    id: number,
    config?: { useSavedProgress: boolean }
  ) {
    let url = `/vocabulary/${id}/test`;

    if (config?.useSavedProgress) {
      url += '?useSavedProgress=true';
    }

    navigate(url);
  }

  return (
    <>
      <Show when={loggedIn()}>
        <VocabularyOverview
          vocabulariesResource={getVocabulariesResource()}
          onGoToVocabulary={onGoToVocabulary}
          onTestVocabulary={onTestVocabulary}
        />
      </Show>
      <Show when={loggedIn() === false}>
        <div class="flex flex-col gap-4 justify-center items-center text-center">
          You've got to sign in/sign up in order to create vocabularies.
          <AuthDialog
            mode="signin"
            trigger={<Button size="sm">Sign in</Button>}
          />
        </div>
      </Show>
    </>
  );
};
