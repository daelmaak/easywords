export const THREE_LETTER_MONTH_WITH_YEAR_OPTIONS: Intl.DateTimeFormatOptions =
  {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  };

export function formatDate(date: Date, options?: Intl.DateTimeFormatOptions) {
  return date.toLocaleDateString(undefined, options);
}
