import { vocabularyApi } from '../../resources/vocabulary-api';
import { fetchVocabulary } from '../../resources/vocabulary-resources';
import { VocabularyOverview } from './VocabularyOverview';

export const VocabularyPage = () => {
  return (
    <VocabularyOverview
      vocabularyApi={vocabularyApi}
      fetchVocabulary={fetchVocabulary}
    />
  );
};
