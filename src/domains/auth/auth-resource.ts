import { createResource } from "solid-js";
import { supabase } from "~/lib/supabase-client";

export const getSessionResource = () =>
  createResource(() => supabase.auth.getSession());
