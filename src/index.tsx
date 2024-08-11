import { Navigate, Route, Router } from '@solidjs/router';
import { render } from 'solid-js/web';

import type { JSX } from 'solid-js';
import { lazy } from 'solid-js';
import App from './components/App';
import { AuthRouteGuard } from './domains/auth/AuthRouteGuard';
import { DashboardPage } from './domains/dashboard/DashboardPage';
import { VocabulariesPage } from './domains/vocabularies/VocabulariesPage';
import { VocabularyTestPage } from './domains/vocabulary-testing/VocabularyTestPage';
import './index.css';
import { VocabularyTestResultsPage } from './domains/vocabulary-results/VocabularyTestResultsPage';
import { QueryClientProvider } from '@tanstack/solid-query';
import { queryClient } from './init/query';

const root = document.getElementById('root');

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    'Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got mispelled?'
  );
}

const VocabularyPage = lazy(
  () => import('./domains/vocabularies/VocabularyPage')
);

const ConjugationsPage = lazy(
  () => import('./domains/conjugations/components/ConjugationsView')
);

const Root = (props: { children?: JSX.Element }) => (
  <QueryClientProvider client={queryClient}>
    <AuthRouteGuard>{props.children}</AuthRouteGuard>
  </QueryClientProvider>
);

render(() => {
  return (
    <Router root={Root}>
      <Route path="/" component={App}>
        <Route path="/dashboard" component={DashboardPage} />
        <Route path="/vocabulary">
          <Route path="/" component={VocabulariesPage} />
          <Route path="/:id" component={VocabularyPage} />
          <Route path="/:id/test" component={VocabularyTestPage} />
          <Route
            path="/:id/test/results"
            component={VocabularyTestResultsPage}
          />
        </Route>
        <Route
          path={[
            '/conjugations',
            '/conjugations/:lang',
            '/conjugations/:lang/:verb',
          ]}
          component={ConjugationsPage}
        />
        <Route path="/" component={() => <Navigate href="/dashboard" />} />
      </Route>
      <Route
        path="/login"
        component={lazy(() => import('./domains/auth/AuthPage'))}
      />
      <Route
        path="/signup"
        component={lazy(() => import('./domains/auth/AuthPage'))}
      />
      <Route path="*" component={() => <Navigate href="/" />} />{' '}
    </Router>
  );
}, root!);
