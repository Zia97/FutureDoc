# Community forum rollout

The forum is feature-complete in the app and database migration, but should be
enabled only after the database and Edge Functions are deployed together. The
new account-deletion client also depends on the `delete-account` function.

## Deployment order

1. Confirm the production project already has `OPENAI_API_KEY`,
   `RESEND_API_KEY`, `SUPPORT_EMAIL_TO`, and `SUPPORT_EMAIL_FROM` configured.
   `FORUM_POLICY_MODEL` is optional and defaults to `gpt-4.1-mini`.
2. Apply `20260928000001_create_forum.sql`.
3. Deploy these functions:
   - `moderate-forum-content`
   - `cleanup-forum-media`
   - `notify-forum-report`
   - `delete-account`
4. Leave `forum_read_enabled` and `forum_posting_enabled` disabled during the
   initial deployment if the app build has not shipped yet. Enable them from
   `app_kill_switches` once the matching mobile build is available.
5. Make the operator account a super admin by setting its existing
   `user_profiles.is_admin` field through Supabase Studio/service-role tooling.

Example CLI sequence after linking the production project:

```sh
supabase db push
supabase functions deploy moderate-forum-content
supabase functions deploy cleanup-forum-media
supabase functions deploy notify-forum-report
supabase functions deploy delete-account
```

Never put the service-role or OpenAI keys in the Expo app environment.

## Smoke tests before enabling posting

- Use two verified non-admin accounts with the same display name and confirm
  that their five-digit forum handles differ.
- Accept the community guidelines, create a text post, and confirm it appears
  immediately only to its author with a Checking badge.
- Confirm a second account cannot see the post until moderation publishes it.
- Submit posts with one and two benign screenshots; confirm a third image
  cannot be selected and no video can be selected.
- Submit deliberately disallowed test text in a non-production test project;
  confirm the optimistic item is removed and never appears to the other user.
- Simulate a missing provider key; confirm the submission becomes
  `pending_review` rather than public.
- Verify search, pagination, replies, author deletion, reporting, user
  reporting, blocking, and unblocking.
- From the admin queue, publish/delete held content, resolve/dismiss a report,
  lock a thread, apply a seven-day ban, apply a permanent ban, and remove it.
- Attempt the same RPCs using a normal account and confirm they fail.
- Delete an account containing screenshots and confirm the storage objects are
  removed while public text is anonymised as `Deleted user`.
- Exercise concurrent post/reply requests and confirm the atomic limits hold.

## Store and policy work outside the repository

- Update the App Store privacy answers to disclose linked user content and
  moderation processing.
- Update Google Play Data safety and content-rating answers for public UGC.
- Mention the in-app Report content, Report user, Block user, filtering, and
  published support address in review notes.
- Review reports promptly and keep the support inbox monitored.

## Operations

Emergency controls live in `app_kill_switches`:

- `forum_read_enabled`: hides forum content.
- `forum_posting_enabled`: makes the forum read-only.
- `forum_moderation_enabled`: holds new submissions for manual review.

Rate limits and the current community-guidelines version live in
`forum_settings`. Raising the guidelines version forces every member to accept
the new version before their next submission.
