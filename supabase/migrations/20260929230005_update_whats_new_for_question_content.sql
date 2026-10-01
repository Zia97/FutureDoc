-- Release version 3: Community, AI Tutor, and refreshed question content.
insert into public.whats_new (version, title, subtitle, items)
values (
  3,
  U&'What''s New \+01F680',
  'Two new ways to make your UCAT prep more connected and more personal:',
  '[
    {
      "icon": "\ud83d\udcac",
      "text": "Student Community is here -- join the new forums to ask questions, swap study tips, and connect with other UCAT students."
    },
    {
      "icon": "\ud83e\udde0",
      "text": "Meet the revamped AI Tutor -- get clearer, more tailored help on the exact question you are working through."
    },
    {
      "icon": "\u2728",
      "text": "Updated content and questions for QR, DM, VR and SJ."
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
