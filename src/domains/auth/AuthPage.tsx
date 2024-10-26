import { Show, createSignal } from 'solid-js';
import type { AuthMode } from './model';
import { useLocation } from '@solidjs/router';
import { AuthForm } from './AuthForm';
import logo from '../../assets/logo.svg';

type State = AuthMode | 'signedup';

export const AuthPage = () => {
  const location = useLocation();
  const isLogin = location.pathname.endsWith('login');

  const [state, setState] = createSignal<State>(isLogin ? 'signin' : 'signup');

  const onSignedUp = () => {
    setState('signedup');
  };

  return (
    <div class="grid h-full w-full grid-rows-[4rem_auto_6rem] gap-8 bg-gray-200">
      <div class="m-auto flex items-center gap-1">
        <img src={logo} alt="logo" class="mb-1 size-8" />
        <span class="text-2xl font-semibold">Easywords</span>
      </div>

      <div class="m-auto min-w-80">
        <Show when={state() === 'signin'}>
          <h1
            class="mb-8 text-center text-3xl font-semibold"
            aria-label="Sign into Easywords"
          >
            Welcome back!
          </h1>
        </Show>
        <Show when={state() === 'signup'}>
          <h1
            class="mb-8 text-center text-3xl font-semibold"
            aria-label="Sign up to Easywords"
          >
            Welcome to Easywords!
          </h1>
        </Show>
        <Show when={state() === 'signedup'}>
          <h1
            class="mb-8 text-center text-3xl font-semibold"
            aria-label="Sign up to Easywords"
          >
            Welcome!
          </h1>
        </Show>

        <main class="rounded-xl bg-white p-4 sm:min-w-96 sm:p-6">
          <Show when={state() === 'signin'}>
            <h2 class="text-center text-lg font-semibold">
              Log into your account
            </h2>
          </Show>
          <Show when={state() === 'signup'}>
            <h2 class="text-center text-lg font-semibold">Create an account</h2>
          </Show>

          <Show
            when={state() !== 'signedup'}
            fallback={<p>Please check your inbox for confirmation email.</p>}
          >
            <AuthForm
              mode={state() as AuthMode}
              onModeChange={setState}
              onSignUp={onSignedUp}
            />
          </Show>
        </main>

        <aside class="mt-8 sm:mt-16">
          <h2 class="mb-4 text-center text-lg font-semibold">How to</h2>
          <div style="padding-bottom:56.25%; position:relative; display:block; width: 100%">
            <iframe
              src="https://app.vidcast.io/share/embed/7c72416a-a85a-4cc0-8603-d1765974d1c3"
              width="100%"
              height="100%"
              title="Watch how to use Easywords"
              loading="lazy"
              allowfullscreen
              style="position:absolute; top:0; left: 0;border: solid; border-radius:12px;"
            ></iframe>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default AuthPage;
