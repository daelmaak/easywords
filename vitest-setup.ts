import '@testing-library/jest-dom/vitest';

window.scrollTo = () => {};
window.IntersectionObserver = class CustomIntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} as any;
