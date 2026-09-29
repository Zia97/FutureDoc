-- Release version 4: make Community, AI Tutor, and refreshed question content the latest What's New entry.
insert into public.whats_new (version, title, subtitle, items, is_active, updated_at)
values (
  4,
  U&'What''s New \+01F680',
  'Two new ways to make your UCAT prep more connected and more personal:',
  '[
    {
      "icon": "\ud83d\udcac",
      "text": "Student Community is here \u2014 join the new forums to ask questions, swap study tips, and connect with other UCAT students."
    },
    {
      "icon": "\ud83e\udde0",
      "text": "Meet the revamped AI Tutor \u2014 get clearer, more tailored help on the exact question you are working through."
    },
    {
      "icon": "\ud83d\udcda",
      "text": "Updated questions and content in all 4 subsections."
    }
  ]'::jsonb,
  true,
  '2026-09-29 17:33:52.945448+00'::timestamptz
)
on conflict (version) do update
set
  title = excluded.title,
  subtitle = excluded.subtitle,
  items = excluded.items,
  is_active = true,
  updated_at = excluded.updated_at;
