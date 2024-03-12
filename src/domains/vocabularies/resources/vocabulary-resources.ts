import { ResourceReturn, createResource } from 'solid-js';
import { fetchVocabularyLists } from './vocabulary-api';
import { VocabularyList } from '../vocabulary-model';

export const fetchVocabularies: ResourceReturn<VocabularyList[]> =
  createResource(fetchVocabularyLists);

export const fetchVocabulary = (id: number) => {
  const [vocabularies] = fetchVocabularies;
  return vocabularies()?.find(v => v.id === id);
};
