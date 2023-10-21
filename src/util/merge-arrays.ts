import { WordTranslation } from '../parser/simple-md-parser';

export function mergeWords(
  arr1: WordTranslation[] = [],
  arr2: WordTranslation[] = []
) {
  const dedupedOrig = new Set(
    arr1.map(w => w.original).concat(arr2.map(w => w.original))
  );
  const dedupedTrans = new Set(
    arr1.map(w => w.translation).concat(arr2.map(w => w.translation))
  );

  const dedupedOrigArr = Array.from(dedupedOrig);
  const dedupedTransArr = Array.from(dedupedTrans);

  const result: WordTranslation[] = [];

  for (let i = 0; i < dedupedOrigArr.length; i++) {
    result.push({
      original: dedupedOrigArr[i],
      translation: dedupedTransArr[i],
    });
  }

  return result;
}
