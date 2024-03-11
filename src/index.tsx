import { Route, Router } from '@solidjs/router';
import { render } from 'solid-js/web';

import App from './components/App';
import { ConjugationsView } from './domains/conjugations/components/ConjugationsView';
import { VocabularyTestPage } from './domains/vocabulary/components/VocabularyTestPage';
import { VocabularyPage } from './domains/vocabulary/components/list-manager/VocabularyPage';
import './index.css';

const root = document.getElementById('root');

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    'Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got mispelled?'
  );
}

render(
  () => (
    <Router root={App}>
      <Route path="/vocabulary">
        <Route path="/" component={VocabularyPage} />
        <Route path="/:id/test" component={VocabularyTestPage} />
      </Route>
      <Route
        path={['/conjugations', '/conjugations/:verb']}
        component={ConjugationsView}
      />
      <Route path="/" component={VocabularyPage} />
    </Router>
  ),
  root!
);
