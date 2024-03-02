import { createResource } from 'solid-js';
import { supabase } from '../../../lib/supabase-client';

export const fetchVocabulary = createResource(() =>
  supabase.from('vocabulary_lists').select(`
    id, 
    vocabulary_items (
      id,
      original,
      translation
    )`)
);
