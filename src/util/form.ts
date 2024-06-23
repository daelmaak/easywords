export function processFormSubmit<T extends object>(event: SubmitEvent): T {
  event.preventDefault();

  const formData = new FormData(event.target as HTMLFormElement);
  const data: any = {};

  formData.forEach((value, key) => {
    data[key] = value;
  });

  return data as T;
}
