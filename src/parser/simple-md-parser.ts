export interface WordTranslation {
  original: string;
  translation: string;
}

export class SimpleMdParser {
  parse(text: string): WordTranslation[] {
    return text
      .split('\n')
      .filter(l => l.includes(' - '))
      .map(l => {
        const [original, translation] = l.split(' - ');
        return {
          original,
          translation,
        };
      });
  }
}
