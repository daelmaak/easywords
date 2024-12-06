import { createSignal } from 'solid-js';

export function observeFirstIntersection() {
  const [intersecting, setIntersecting] = createSignal(false);
  let scrollObserver: IntersectionObserver | undefined;

  function startObserving(element: HTMLElement) {
    const observer = new IntersectionObserver(entries => {
      if (intersecting() || !entries[0].isIntersecting) {
        return;
      }
      setIntersecting(true);
      observer.unobserve(element);
    });
    observer.observe(element);
    scrollObserver = observer;
  }

  function stopObserving() {
    scrollObserver?.disconnect();
  }

  return [intersecting, startObserving, stopObserving] as const;
}
