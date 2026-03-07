-- =============================================================================
-- Trade Levels — Full Supabase Migration
-- =============================================================================
-- HOW TO RUN:
--   1. Open your Supabase project dashboard
--   2. Go to SQL Editor → New Query
--   3. Paste this entire file and click "Run"
--   4. You should see "Success" for each statement
--
-- NOTES:
--   • Run this ONCE on a fresh project. Re-running is safe (uses IF NOT EXISTS
--     and ON CONFLICT DO NOTHING).
--   • The profiles table is created before groups to avoid circular FK issues.
--     groups.admin_id references profiles; profiles.group_id references groups.
--     We add the profiles FK after creating groups.
--   • Storage bucket 'level-uploads' is created as PRIVATE (public = false).
--     Signed URLs are used by the frontend for image display.
-- =============================================================================

-- 0. Extensions
create extension if not exists "pgcrypto";

-- =============================================================================
-- 1. profiles (created BEFORE groups to allow groups to reference it)
--    group_id FK added after groups table exists (see ALTER TABLE below)
-- =============================================================================
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  username    text not null unique,
  group_id    uuid,                          -- FK added below after groups exists
  is_admin    boolean not null default false,
  created_at  timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles_select" on public.profiles;
create policy "profiles_select"
  on public.profiles for select
  using (true);

drop policy if exists "profiles_insert" on public.profiles;
create policy "profiles_insert"
  on public.profiles for insert
  with check (auth.uid() = id);

drop policy if exists "profiles_update" on public.profiles;
create policy "profiles_update"
  on public.profiles for update
  using (auth.uid() = id);

-- =============================================================================
-- 2. groups
-- =============================================================================
create table if not exists public.groups (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  invite_code  text not null unique,
  admin_id     uuid not null references public.profiles(id) on delete restrict,
  member_count int not null default 1 check (member_count <= 50),
  created_at   timestamptz not null default now()
);

alter table public.groups enable row level security;

drop policy if exists "groups_select" on public.groups;
create policy "groups_select"
  on public.groups for select
  using (true);

drop policy if exists "groups_insert" on public.groups;
create policy "groups_insert"
  on public.groups for insert
  with check (auth.uid() = admin_id);

drop policy if exists "groups_update" on public.groups;
create policy "groups_update"
  on public.groups for update
  using (auth.uid() = admin_id);

drop policy if exists "groups_delete" on public.groups;
create policy "groups_delete"
  on public.groups for delete
  using (auth.uid() = admin_id);

-- Now add the FK from profiles.group_id → groups.id
do $$
begin
  if not exists (
    select 1 from information_schema.table_constraints
    where constraint_name = 'profiles_group_id_fkey'
      and table_name = 'profiles'
      and table_schema = 'public'
  ) then
    alter table public.profiles
      add constraint profiles_group_id_fkey
      foreign key (group_id) references public.groups(id) on delete set null;
  end if;
end $$;

-- =============================================================================
-- 3. group_members
-- =============================================================================
create table if not exists public.group_members (
  id        uuid primary key default gen_random_uuid(),
  group_id  uuid not null references public.groups(id) on delete cascade,
  user_id   uuid not null references public.profiles(id) on delete cascade,
  joined_at timestamptz not null default now(),
  unique(group_id, user_id)
);

alter table public.group_members enable row level security;

drop policy if exists "group_members_select" on public.group_members;
create policy "group_members_select"
  on public.group_members for select
  using (true);

drop policy if exists "group_members_insert" on public.group_members;
create policy "group_members_insert"
  on public.group_members for insert
  with check (auth.uid() = user_id);

drop policy if exists "group_members_delete" on public.group_members;
create policy "group_members_delete"
  on public.group_members for delete
  using (auth.uid() = user_id);

-- =============================================================================
-- 4. levels
-- =============================================================================
create table if not exists public.levels (
  id                  uuid primary key default gen_random_uuid(),
  price               numeric(20, 8) not null,
  direction           text not null check (direction in ('long', 'short')),
  take_profit         numeric(20, 8),
  stop_loss           numeric(20, 8),
  group_id            uuid not null references public.groups(id) on delete cascade,
  creator_id          uuid not null references public.profiles(id) on delete cascade,
  likes               int not null default 1,
  dislikes            int not null default 0,
  score               int not null default 1,
  created_at          timestamptz not null default now(),
  last_interaction_at timestamptz not null default now()
);

create index if not exists levels_group_id_idx on public.levels(group_id);
create index if not exists levels_score_idx on public.levels(group_id, score desc, last_interaction_at desc);

alter table public.levels enable row level security;

drop policy if exists "levels_select" on public.levels;
create policy "levels_select"
  on public.levels for select
  using (
    exists (
      select 1 from public.group_members gm
      where gm.group_id = levels.group_id
        and gm.user_id = auth.uid()
    )
  );

drop policy if exists "levels_insert" on public.levels;
create policy "levels_insert"
  on public.levels for insert
  with check (
    exists (
      select 1 from public.group_members gm
      where gm.group_id = levels.group_id
        and gm.user_id = auth.uid()
    )
  );

drop policy if exists "levels_update" on public.levels;
create policy "levels_update"
  on public.levels for update
  using (
    exists (
      select 1 from public.group_members gm
      where gm.group_id = levels.group_id
        and gm.user_id = auth.uid()
    )
  );

drop policy if exists "levels_delete" on public.levels;
create policy "levels_delete"
  on public.levels for delete
  using (
    exists (
      select 1 from public.group_members gm
      where gm.group_id = levels.group_id
        and gm.user_id = auth.uid()
    )
  );

-- =============================================================================
-- 5. votes
-- =============================================================================
create table if not exists public.votes (
  id         uuid primary key default gen_random_uuid(),
  level_id   uuid not null references public.levels(id) on delete cascade,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  vote_type  text not null check (vote_type in ('like', 'dislike')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(level_id, user_id)
);

create index if not exists votes_level_id_idx on public.votes(level_id);
create index if not exists votes_user_id_idx on public.votes(user_id);

alter table public.votes enable row level security;

drop policy if exists "votes_select" on public.votes;
create policy "votes_select"
  on public.votes for select
  using (auth.uid() = user_id);

drop policy if exists "votes_insert" on public.votes;
create policy "votes_insert"
  on public.votes for insert
  with check (auth.uid() = user_id);

drop policy if exists "votes_update" on public.votes;
create policy "votes_update"
  on public.votes for update
  using (auth.uid() = user_id);

drop policy if exists "votes_delete" on public.votes;
create policy "votes_delete"
  on public.votes for delete
  using (auth.uid() = user_id);

-- =============================================================================
-- 6. tags
-- =============================================================================
create table if not exists public.tags (
  id         uuid primary key default gen_random_uuid(),
  text       text not null unique,
  created_at timestamptz not null default now()
);

alter table public.tags enable row level security;

drop policy if exists "tags_select" on public.tags;
create policy "tags_select"
  on public.tags for select
  using (true);

drop policy if exists "tags_insert" on public.tags;
create policy "tags_insert"
  on public.tags for insert
  with check (auth.role() = 'authenticated');

-- =============================================================================
-- 7. level_tags
-- =============================================================================
create table if not exists public.level_tags (
  id         uuid primary key default gen_random_uuid(),
  level_id   uuid not null references public.levels(id) on delete cascade,
  tag_id     uuid not null references public.tags(id) on delete cascade,
  count      int not null default 1,
  created_at timestamptz not null default now(),
  unique(level_id, tag_id)
);

create index if not exists level_tags_level_id_idx on public.level_tags(level_id);

alter table public.level_tags enable row level security;

drop policy if exists "level_tags_select" on public.level_tags;
create policy "level_tags_select"
  on public.level_tags for select
  using (true);

drop policy if exists "level_tags_insert" on public.level_tags;
create policy "level_tags_insert"
  on public.level_tags for insert
  with check (auth.role() = 'authenticated');

drop policy if exists "level_tags_update" on public.level_tags;
create policy "level_tags_update"
  on public.level_tags for update
  using (auth.role() = 'authenticated');

-- =============================================================================
-- 8. archived_levels
--    Tags are stored in a separate archived_level_tags table (below)
--    because the original level is deleted on archive.
-- =============================================================================
create table if not exists public.archived_levels (
  id          uuid primary key default gen_random_uuid(),
  original_level_id  uuid,               -- reference only (level may be deleted)
  group_id    uuid not null references public.groups(id) on delete cascade,
  price       numeric(20, 8) not null,
  direction   text not null check (direction in ('long', 'short')),
  take_profit numeric(20, 8),
  stop_loss   numeric(20, 8),
  creator_id  uuid not null references public.profiles(id) on delete cascade,
  outcome     text not null check (outcome in ('tapped', 'failed')),
  likes       int not null default 0,
  dislikes    int not null default 0,
  score       int not null default 0,
  created_at  timestamptz not null default now(),
  archived_at timestamptz not null default now()
);

create index if not exists archived_levels_group_id_idx on public.archived_levels(group_id);
create index if not exists archived_levels_creator_id_idx on public.archived_levels(creator_id);

alter table public.archived_levels enable row level security;

drop policy if exists "archived_levels_select" on public.archived_levels;
create policy "archived_levels_select"
  on public.archived_levels for select
  using (
    exists (
      select 1 from public.group_members gm
      where gm.group_id = archived_levels.group_id
        and gm.user_id = auth.uid()
    )
  );

drop policy if exists "archived_levels_insert" on public.archived_levels;
create policy "archived_levels_insert"
  on public.archived_levels for insert
  with check (
    exists (
      select 1 from public.group_members gm
      where gm.group_id = archived_levels.group_id
        and gm.user_id = auth.uid()
    )
  );

drop policy if exists "archived_levels_delete" on public.archived_levels;
create policy "archived_levels_delete"
  on public.archived_levels for delete
  using (
    -- Creator can delete their own archived levels
    creator_id = auth.uid()
    -- OR group admin can delete any archived level in their group
    or exists (
      select 1 from public.groups g
      where g.id = archived_levels.group_id
        and g.admin_id = auth.uid()
    )
    -- OR any group member can delete (fallback for simpler permissions)
    or exists (
      select 1 from public.group_members gm
      where gm.group_id = archived_levels.group_id
        and gm.user_id = auth.uid()
    )
  );

-- =============================================================================
-- 9. archived_level_tags  (snapshot of tags at the time of archiving)
-- =============================================================================
create table if not exists public.archived_level_tags (
  id                 uuid primary key default gen_random_uuid(),
  archived_level_id  uuid not null references public.archived_levels(id) on delete cascade,
  tag_text           text not null,
  count              int not null default 1
);

create index if not exists archived_level_tags_level_idx on public.archived_level_tags(archived_level_id);

alter table public.archived_level_tags enable row level security;

drop policy if exists "archived_level_tags_select" on public.archived_level_tags;
create policy "archived_level_tags_select"
  on public.archived_level_tags for select
  using (true);

drop policy if exists "archived_level_tags_insert" on public.archived_level_tags;
create policy "archived_level_tags_insert"
  on public.archived_level_tags for insert
  with check (auth.role() = 'authenticated');

-- =============================================================================
-- 10. level_uploads  (notes + images attached to archived levels)
-- =============================================================================
create table if not exists public.level_uploads (
  id                 uuid primary key default gen_random_uuid(),
  archived_level_id  uuid not null references public.archived_levels(id) on delete cascade,
  user_id            uuid not null references public.profiles(id) on delete cascade,
  image_path         text,         -- storage path (used to generate signed URL)
  body               text,
  created_at         timestamptz not null default now()
);

create index if not exists level_uploads_archived_idx on public.level_uploads(archived_level_id);

alter table public.level_uploads enable row level security;

drop policy if exists "level_uploads_select" on public.level_uploads;
create policy "level_uploads_select"
  on public.level_uploads for select
  using (
    exists (
      select 1
      from public.archived_levels al
      join public.group_members gm on gm.group_id = al.group_id
      where al.id = level_uploads.archived_level_id
        and gm.user_id = auth.uid()
    )
  );

drop policy if exists "level_uploads_insert" on public.level_uploads;
create policy "level_uploads_insert"
  on public.level_uploads for insert
  with check (auth.uid() = user_id);

-- =============================================================================
-- 11. Storage bucket: level-uploads (PRIVATE — uses signed URLs)
-- =============================================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'level-uploads',
  'level-uploads',
  false,
  10485760,   -- 10 MB limit
  array['image/jpeg','image/png','image/gif','image/webp','image/heic']
)
on conflict (id) do nothing;

-- Storage RLS (storage.objects)
drop policy if exists "level_uploads_storage_insert" on storage.objects;
create policy "level_uploads_storage_insert"
  on storage.objects for insert
  with check (
    bucket_id = 'level-uploads'
    and auth.role() = 'authenticated'
  );

drop policy if exists "level_uploads_storage_select" on storage.objects;
create policy "level_uploads_storage_select"
  on storage.objects for select
  using (
    bucket_id = 'level-uploads'
    and auth.role() = 'authenticated'
  );

drop policy if exists "level_uploads_storage_delete" on storage.objects;
create policy "level_uploads_storage_delete"
  on storage.objects for delete
  using (
    bucket_id = 'level-uploads'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- =============================================================================
-- DONE. All tables, indexes, RLS policies and storage are configured.
-- =============================================================================
