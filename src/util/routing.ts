import { Navigator, Params } from '@solidjs/router';

export function createSearchString(params: Params) {
  const search = new URLSearchParams();

  for (const key in params) {
    const value = params[key];
    search.set(key, value);
  }

  const searchString = search.toString();

  return searchString ? `?${searchString}` : '';
}

export function navigateTo(
  path: string,
  {
    navigate,
    searchParams,
  }: {
    navigate: Navigator;
    searchParams?: Params;
  }
) {
  const searchString = searchParams ? createSearchString(searchParams) : '';
  navigate(`${path}${searchString}`);
}
