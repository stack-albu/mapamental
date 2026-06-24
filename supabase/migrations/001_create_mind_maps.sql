create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.mind_maps (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 140),
  description text not null default '',
  status text not null default 'active' check (status in ('draft', 'active', 'archived')),
  visibility text not null default 'private' check (visibility in ('private', 'shared', 'public')),
  tags text[] not null default '{}',
  nodes jsonb not null default '[]'::jsonb,
  edges jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.mind_map_nodes (
  id uuid primary key default gen_random_uuid(),
  mind_map_id uuid not null references public.mind_maps(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  client_id text not null,
  parent_client_id text,
  label text not null check (char_length(label) between 1 and 180),
  note text not null default '',
  color text not null default '#e76f51',
  position_x numeric not null default 0,
  position_y numeric not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (mind_map_id, client_id)
);

create table if not exists public.mind_map_edges (
  id uuid primary key default gen_random_uuid(),
  mind_map_id uuid not null references public.mind_maps(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  client_id text not null,
  source_client_id text not null,
  target_client_id text not null,
  label text not null default '',
  animated boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (mind_map_id, client_id)
);

create table if not exists public.mind_map_tags (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 48),
  color text not null default '#457b9d',
  created_at timestamptz not null default now()
);

create table if not exists public.mind_map_shares (
  id uuid primary key default gen_random_uuid(),
  mind_map_id uuid not null references public.mind_maps(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  shared_with uuid references auth.users(id) on delete cascade,
  role text not null default 'viewer' check (role in ('viewer', 'editor')),
  invite_email text,
  created_at timestamptz not null default now(),
  unique (mind_map_id, shared_with)
);

create index if not exists profiles_updated_at_idx on public.profiles(updated_at desc);
create index if not exists mind_maps_user_id_idx on public.mind_maps(user_id);
create index if not exists mind_maps_status_idx on public.mind_maps(status);
create index if not exists mind_maps_visibility_idx on public.mind_maps(visibility);
create index if not exists mind_maps_updated_at_idx on public.mind_maps(updated_at desc);
create index if not exists mind_maps_tags_idx on public.mind_maps using gin(tags);
create index if not exists mind_map_nodes_map_idx on public.mind_map_nodes(mind_map_id);
create index if not exists mind_map_nodes_user_idx on public.mind_map_nodes(user_id);
create index if not exists mind_map_edges_map_idx on public.mind_map_edges(mind_map_id);
create index if not exists mind_map_edges_user_idx on public.mind_map_edges(user_id);
create index if not exists mind_map_tags_user_idx on public.mind_map_tags(user_id);
create unique index if not exists mind_map_tags_user_lower_name_idx on public.mind_map_tags(user_id, lower(name));
create index if not exists mind_map_shares_map_idx on public.mind_map_shares(mind_map_id);
create index if not exists mind_map_shares_shared_with_idx on public.mind_map_shares(shared_with);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists set_mind_maps_updated_at on public.mind_maps;
create trigger set_mind_maps_updated_at
before update on public.mind_maps
for each row execute function public.set_updated_at();

drop trigger if exists set_mind_map_nodes_updated_at on public.mind_map_nodes;
create trigger set_mind_map_nodes_updated_at
before update on public.mind_map_nodes
for each row execute function public.set_updated_at();

drop trigger if exists set_mind_map_edges_updated_at on public.mind_map_edges;
create trigger set_mind_map_edges_updated_at
before update on public.mind_map_edges
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.mind_maps enable row level security;
alter table public.mind_map_nodes enable row level security;
alter table public.mind_map_edges enable row level security;
alter table public.mind_map_tags enable row level security;
alter table public.mind_map_shares enable row level security;

drop policy if exists "Users can read their own profile" on public.profiles;
create policy "Users can read their own profile"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "Users can read owned or shared mind maps" on public.mind_maps;
create policy "Users can read owned or shared mind maps"
  on public.mind_maps for select
  using (
    auth.uid() = user_id
    or visibility = 'public'
    or exists (
      select 1 from public.mind_map_shares shares
      where shares.mind_map_id = id
      and shares.shared_with = auth.uid()
    )
  );

drop policy if exists "Users can insert their own mind maps" on public.mind_maps;
create policy "Users can insert their own mind maps"
  on public.mind_maps for insert
  with check (auth.uid() = user_id);

drop policy if exists "Owners and editors can update mind maps" on public.mind_maps;
create policy "Owners and editors can update mind maps"
  on public.mind_maps for update
  using (
    auth.uid() = user_id
    or exists (
      select 1 from public.mind_map_shares shares
      where shares.mind_map_id = id
      and shares.shared_with = auth.uid()
      and shares.role = 'editor'
    )
  )
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own mind maps" on public.mind_maps;
create policy "Users can delete their own mind maps"
  on public.mind_maps for delete
  using (auth.uid() = user_id);

drop policy if exists "Users can manage nodes for accessible maps" on public.mind_map_nodes;
create policy "Users can manage nodes for accessible maps"
  on public.mind_map_nodes for all
  using (
    exists (
      select 1 from public.mind_maps maps
      where maps.id = mind_map_id
      and maps.user_id = auth.uid()
    )
  )
  with check (auth.uid() = user_id);

drop policy if exists "Users can manage edges for accessible maps" on public.mind_map_edges;
create policy "Users can manage edges for accessible maps"
  on public.mind_map_edges for all
  using (
    exists (
      select 1 from public.mind_maps maps
      where maps.id = mind_map_id
      and maps.user_id = auth.uid()
    )
  )
  with check (auth.uid() = user_id);

drop policy if exists "Users can manage their tags" on public.mind_map_tags;
create policy "Users can manage their tags"
  on public.mind_map_tags for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can read shares involving them" on public.mind_map_shares;
create policy "Users can read shares involving them"
  on public.mind_map_shares for select
  using (auth.uid() = owner_id or auth.uid() = shared_with);

drop policy if exists "Owners can manage shares" on public.mind_map_shares;
create policy "Owners can manage shares"
  on public.mind_map_shares for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);