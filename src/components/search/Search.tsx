import Fuse from 'fuse.js';
import { Input } from '../ui/input';

interface Props<T> {
  terms: T[];
  searchKeys: (keyof T)[];
  onSearch: (result: T[]) => void;
}

export const Search = <T,>(props: Props<T>) => {
  const fuse = new Fuse(props.terms, {
    keys: ['original', 'translation'],
    threshold: 0.3,
  });

  function search(query: string) {
    if (!query) {
      return props.onSearch(props.terms);
    }
    const result = fuse.search(query);
    props.onSearch(result.map(r => r.item));
  }

  return (
    <Input
      class="w-auto"
      placeholder="Search..."
      onInput={e => search(e.target.value)}
    />
  );
};
