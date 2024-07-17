import type { Session } from '@supabase/supabase-js';
import { createResource } from 'solid-js';
import { supabase } from '~/lib/supabase-client';

export const sessionResource = createResource(() =>
  supabase.auth.getSession().then(s => s.data.session)
);

export const isLoggedIn = (session: Session | undefined | null) => {
  // Here, the session is undefined when the session is loading
  if (session === undefined) return undefined;
  // Here, the session is null when the user is not logged in
  if (session === null) return false;
  return session.user !== null;
};

export const signIn = async (email: string, password: string) => {
  const result = await supabase.auth.signInWithPassword({ email, password });
  await sessionResource[1].refetch();

  return result;
};

export const signUp = async (email: string, password: string) => {
  const result = await supabase.auth.signUp({ email, password });
  return result;
};

export const signOut = async () => {
  await supabase.auth.signOut();
  await sessionResource[1].refetch();
};
