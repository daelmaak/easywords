import Fuse from 'fuse.js';
import { createEffect, createSignal } from 'solid-js';
import { Input } from '../ui/input';

interface Props<T> {
  terms: T[];
  searchKeys: (keyof T)[];
  placeholder?: string;
  onSearch: (result: T[]) => void;
}

export const Search = <T,>(props: Props<T>) => {
  const [query, setQuery] = createSignal('');

  const fuse = new Fuse(props.terms, {
    keys: ['original', 'translation'],
    threshold: 0.3,
  });

  createEffect(() => {
    fuse.setCollection(props.terms);
    search(query());

    return props.terms;
  });

  function search(query: string) {
    setQuery(query);

    if (!query) {
      return props.onSearch(props.terms);
    }
    const result = fuse.search(query);
    props.onSearch(result.map(r => r.item));
  }

  return (
    <Input
      class="w-auto"
      placeholder={props.placeholder ?? 'Search...'}
      type="search"
      onInput={e => search(e.target.value)}
    />
  );
};
