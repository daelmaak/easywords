import { get, set } from "idb-keyval";
import { SavedProgress } from "~/domains/vocabulary-testing/vocabulary-testing-model";

export const deleteVocabularyProgress = async (vocabularyId: number) => {
  await set(`vocabulary.${vocabularyId}.progress`, undefined);
}

export const fetchVocabularyProgress = async (vocabularyId: number) => {
  return await get<SavedProgress>(`vocabulary.${vocabularyId}.progress`);
};

export const saveVocabularyProgress = async (
  vocabularyId: number,
  progress: SavedProgress
) => {
  await set(`vocabulary.${vocabularyId}.progress`, JSON.parse(JSON.stringify(progress)));
};