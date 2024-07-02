import { useNavigate, useSearchParams } from '@solidjs/router';
import { VocabularyOverview } from './components/VocabularyOverview';
import { getVocabulariesResource } from './resources/vocabularies-resource';
import { navigateToVocabularyTest } from './util/navigation';

export const VocabulariesPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  function onGoToVocabulary(id: number) {
    navigate(`/vocabulary/${id}`);
  }

  function onTestVocabulary(
    id: number,
    config?: { useSavedProgress: boolean }
  ) {
    navigateToVocabularyTest(id, navigate, config);
  }

  return (
    <VocabularyOverview
      vocabularyCreatorOpenAtInit={searchParams.openVocabCreator != null}
      vocabulariesResource={getVocabulariesResource()}
      onGoToVocabulary={onGoToVocabulary}
      onTestVocabulary={onTestVocabulary}
    />
  );
};
