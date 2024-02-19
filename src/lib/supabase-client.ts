import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  'https://xfoimduikmubsmuomviv.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhmb2ltZHVpa211YnNtdW9tdml2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDgzNDM4MDUsImV4cCI6MjAyMzkxOTgwNX0.-bwt9Jh1vj4YldCzkARlEi6LZbyuHavz9J_c6vygXUY'
);
