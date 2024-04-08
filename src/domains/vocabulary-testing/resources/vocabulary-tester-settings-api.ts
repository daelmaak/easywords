import { supabase } from '~/lib/supabase-client';
import { VocabularyTesterSettings } from '../vocabulary-testing-model';

const fetchSettings = async () => {
  let result = await supabase.from('vocabulary_tester_settings').select(`
    reverse_words,
    repeat_incorrect_words,
    write_words
  `);

  return result.data?.[0];
};

const updateSettings = async (settings: VocabularyTesterSettings) => {
  let result = await supabase
    .from('vocabulary_tester_settings')
    .upsert(settings)
    .select();
  return result.data?.[0];
};
