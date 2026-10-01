-- Release version 2: introduce Community and the refreshed AI Tutor.
-- The app displays the highest active version that a user has not already seen.
insert into public.whats_new (version, title, subtitle, items)
values (
  2,
  'What''s New 🚀',
  'Two new ways to make your UCAT prep more connected and more personal:',
  '[
    {
      "icon": "💬",
      "text": "Student Community is here — join the new forums to ask questions, swap study tips, and connect with other UCAT students."
    },
    {
      "icon": "🧠",
      "text": "Meet the revamped AI Tutor — get clearer, more tailored help on the exact question you are working through."
    }
  ]'::jsonb
)
on conflict (version) do update
set
  title = excluded.title,
  subtitle = excluded.subtitle,
  items = excluded.items,
  is_active = true,
  updated_at = now();
