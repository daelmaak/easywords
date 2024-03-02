import { createResource } from 'solid-js';
import { supabase } from '../../../lib/supabase-client';
import { ResourceReturn } from 'solid-js';
import { VocabularyList } from '../vocabulary-model';

export const fetchVocabulary: ResourceReturn<VocabularyList[]> = createResource(
  async () => {
    const result = await supabase.from('vocabulary_lists').select(
      `
    id, 
    name,
    vocabulary_items (
      id,
      original,
      translation
    )`
    );

    return result.data ?? [];
  }
);
