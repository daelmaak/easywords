import { Router, Route } from '@solidjs/router';
import { render } from 'solid-js/web';

import App from './components/App';
import { ConjugationsView } from './domains/conjugations/components/ConjugationsView';
import { VocabularyView } from './domains/vocabulary/components/VocabularyView';
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
      <Route path="/" component={VocabularyView} />
      <Route path="/vocabulary" component={VocabularyView} />
      <Route
        path={['/conjugations', '/conjugations/:verb']}
        component={ConjugationsView}
      />
    </Router>
  ),
  root!
);
