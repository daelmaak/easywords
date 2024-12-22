export function tokenizeWord(text: string) {
  // 1 char tokens are probably articles, not words, so ignore them
  return text.split(/[\s,/]+/).filter(t => t.length > 1);
}
