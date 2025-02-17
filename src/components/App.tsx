import { type Component, type JSX } from 'solid-js';
import { signOut } from '~/domains/auth/auth-resource';
import { resetApp } from '../init/app-init';
import { Header } from './header';

interface Props {
  children?: JSX.Element;
}

const App: Component<Props> = props => {
  async function onSignOut() {
    await signOut();
    resetApp();
  }

  return (
    <>
      <Header onSignOut={onSignOut} />
      <div class="w-full flex-grow">{props.children}</div>
    </>
  );
};

export default App;
