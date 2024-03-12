import { VocabularyOverview } from './components/VocabularyOverview';
import { vocabularyApi } from '~/domains/vocabularies/resources/vocabulary-api';
import { fetchVocabulary } from '~/domains/vocabularies/resources/vocabulary-resources';

export const VocabulariesPage = () => {
  return (
    <VocabularyOverview
      vocabularyApi={vocabularyApi}
      fetchVocabulary={fetchVocabulary}
    />
  );
};
