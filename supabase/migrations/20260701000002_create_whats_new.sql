create table if not exists public.whats_new (
  version    int primary key,
  title      text not null,
  subtitle   text not null,
  items      jsonb not null default '[]'::jsonb, -- [{ "icon": "🎁", "text": "..." }, ...]
  is_active  boolean not null default true,
  updated_at timestamptz not null default now()
);

alter table public.whats_new enable row level security;

-- Anyone (including anon) can read; writes are service-role only (Studio / service key).
drop policy if exists "whats_new_read" on public.whats_new;
create policy "whats_new_read"
  on public.whats_new
  for select
  using (true);

-- Seed the current (previously hardcoded) content as version 1 so this release is unchanged.
insert into public.whats_new (version, title, subtitle, items)
values (
  1,
  'What''s New 🚀',
  'Here''s what we''ve been working on for you:',
  '[
    { "icon": "🎁", "text": "Try UCAT Genius Premium completely free. No commitment or payment details required. Just give it a go!" },
    { "icon": "🐛", "text": "Fixed an issue where timed test answers could be lost during network interruptions" },
    { "icon": "📚", "text": "Corrected a faulty Venn diagram in a Decision Making worked example" }
  ]'::jsonb
)
on conflict (version) do nothing;
