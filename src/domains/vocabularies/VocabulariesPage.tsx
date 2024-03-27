import { useNavigate } from '@solidjs/router';
import { getVocabulariesResource } from '~/domains/vocabularies/resources/vocabulary-resources';
import { VocabularyOverview } from './components/VocabularyOverview';

export const VocabulariesPage = () => {
  const navigate = useNavigate();

  function onTestVocabulary(id: number) {
    navigate(`/vocabulary/${id}/test`);
  }

  return (
    <VocabularyOverview
      vocabulariesResource={getVocabulariesResource()}
      onTestVocabulary={onTestVocabulary}
    />
  );
};
