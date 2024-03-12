import { useNavigate } from '@solidjs/router';
import { VocabularyOverview } from './components/VocabularyOverview';
import { vocabularyApi } from '~/domains/vocabularies/resources/vocabulary-api';
import { fetchVocabularies } from '~/domains/vocabularies/resources/vocabulary-resources';

export const VocabulariesPage = () => {
  const navigate = useNavigate();

  function onTestVocabulary(id: number) {
    navigate(`/vocabulary/${id}/test`);
  }

  return (
    <VocabularyOverview
      vocabularyApi={vocabularyApi}
      fetchVocabularies={fetchVocabularies}
      onTestVocabulary={onTestVocabulary}
    />
  );
};
