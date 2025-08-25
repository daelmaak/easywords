import { Navigate, Route, Router } from '@solidjs/router';
import { render } from 'solid-js/web';
import { initializeApp } from 'firebase/app';
import { getMessaging, onMessage } from 'firebase/messaging';

import { lazy } from 'solid-js';
import App from './components/App';
import { AuthRouteGuard } from './domains/auth/AuthRouteGuard';
import { VocabulariesPage } from './domains/vocabularies/VocabulariesPage';
import { VocabularyTestPage } from './domains/vocabulary-testing/VocabularyTestPage';
import './index.css';
import { VocabularyTestResultsPage } from './domains/vocabulary-results/VocabularyTestResultsPage';
import { QueryClientProvider } from '@tanstack/solid-query';
import { initApp } from './init/app-init';
import { Routes } from './routes/routes';
import { requestPermission } from './domains/notifications/notifications';

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
  () => import('./domains/conjugations/components/ConjugationsPage')
);

render(() => {
  const { queryClient } = initApp();

  return (
    <QueryClientProvider client={queryClient}>
      <Router root={AuthRouteGuard}>
        <Route path="/" component={App}>
          <Route
            path={Routes.VocabularyTestResults}
            component={VocabularyTestResultsPage}
          />
          <Route path={Routes.VocabularyTest} component={VocabularyTestPage} />
          <Route path={Routes.Vocabulary} component={VocabularyPage} />
          <Route path={Routes.Vocabularies} component={VocabulariesPage} />
          <Route path={Routes.Conjugations} component={ConjugationsPage} />
          <Route
            path={`${Routes.Conjugations}/:lang/:verb`}
            component={ConjugationsPage}
          />
          <Route path="/" component={() => <Navigate href="/vocabularies" />} />
        </Route>
        <Route
          path={Routes.Login}
          component={lazy(() => import('./domains/auth/AuthPage'))}
        />
        <Route
          path={Routes.Signup}
          component={lazy(() => import('./domains/auth/AuthPage'))}
        />
        <Route path="*" component={() => <Navigate href="/" />} />{' '}
      </Router>
    </QueryClientProvider>
  );
}, root!);

const firebaseConfig = {
  apiKey: 'AIzaSyDZG8HNUdn-saTnYv9Ren0nQbSQRPnzngk',
  authDomain: 'easywords-3083d.firebaseapp.com',
  projectId: 'easywords-3083d',
  storageBucket: 'easywords-3083d.firebasestorage.app',
  messagingSenderId: '386545686156',
  appId: '1:386545686156:web:0d7bb2cd0069c21df40da9',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);

requestPermission();

onMessage(messaging, payload => {
  console.log('Message received. ', payload);
  // ...
});
