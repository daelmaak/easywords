import { ResourceReturn, createResource } from 'solid-js';
import { fetchVocabularyLists } from './vocabulary-api';
import { VocabularyList } from '../vocabulary-model';

export const fetchVocabulary: ResourceReturn<VocabularyList[]> =
  createResource(fetchVocabularyLists);
