import { Route, Router } from '@solidjs/router';
import { render } from 'solid-js/web';

import App from './components/App';
import { ConjugationsView } from './domains/conjugations/components/ConjugationsView';
import { VocabulariesPage } from './domains/vocabularies/VocabulariesPage';
import { VocabularyTestPage } from './domains/vocabulary-testing/VocabularyTestPage';
import './index.css';
import { initApp } from './init/app-init';
import { VocabularyPage } from './domains/vocabularies/VocabularyPage';

const root = document.getElementById('root');

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    'Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got mispelled?'
  );
}

initApp();

render(
  () => (
    <Router root={App}>
      <Route path="/vocabulary">
        <Route path="/" component={VocabulariesPage} />
        <Route path="/:id" component={VocabularyPage} />
        <Route path="/:id/test" component={VocabularyTestPage} />
      </Route>
      <Route
        path={['/conjugations', '/conjugations/:verb']}
        component={ConjugationsView}
      />
      <Route path="/" component={VocabulariesPage} />
    </Router>
  ),
  root!
);
