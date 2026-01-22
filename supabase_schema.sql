-- Create a table for storing missions
create table missions (
  id text primary key,
  title text not null,
  data jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table missions enable row level security;

-- Create a policy that allows everyone to read missions
create policy "Public missions are viewable by everyone"
  on missions for select
  using ( true );

-- Create a policy that allows authenticated users (or just everyone if open) to insert/update
-- For this MVP, we might allow public insert if secured by API token in the backend, 
-- but since we are using the Service Role or Anon Key, we need to be careful.
-- If we use the backend to insert, we can use the SERVICE_ROLE_KEY or just allow anon insert for now if we don't have auth.
-- But the prompt implies "admin" creates them.
-- Let's allow anon insert for simplicity as per "simple API backend" request, 
-- or rely on the fact that we will likely use the backend to insert.
-- If using backend with `supabase-js`, we usually use the service role key to bypass RLS, 
-- or we can set a policy.

-- For now, allow anon insert/update for "Producer Mode" and "Content Ingest"
create policy "Enable insert for all users" on missions for insert with check (true);
create policy "Enable update for all users" on missions for update using (true);
