import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { PGlite } from '@electric-sql/pglite';

const admin = '00000000-0000-4000-8000-000000000001';
const tester = '00000000-0000-4000-8000-000000000002';
const student = '00000000-0000-4000-8000-000000000003';
test('tester permission is protected on inserts and updates, service-only grants are audited, and no admin privileges are added', async () => {
  const db = new PGlite();
  try {
    await db.exec(`create role anon; create role authenticated; create role service_role bypassrls;
      create schema auth; create table auth.users(id uuid primary key);
      create function auth.role() returns text language sql as $$select current_setting('request.jwt.claim.role', true)$$;
      create table user_profiles(user_id uuid primary key references auth.users(id), display_name text,
        is_admin boolean default false, is_premium boolean default false);
      grant usage on schema public, auth to anon, authenticated, service_role;
      grant select, insert, update on user_profiles to authenticated, service_role;
      insert into auth.users values('${admin}'),('${tester}'),('${student}');
      insert into user_profiles(user_id,is_admin) values('${admin}',true),('${tester}',false);`);
    await db.exec(fs.readFileSync('supabase/migrations/20261021000002_marketing_tester_access.sql', 'utf8'));
    await db.exec(`set role authenticated; select set_config('request.jwt.claim.role','authenticated',false);
      insert into user_profiles(user_id,marketing_tester_expires_at) values('${student}',now()+interval '90 days');
      update user_profiles set marketing_tester_expires_at=now()+interval '90 days',display_name='Student' where user_id='${tester}';`);
    assert.equal((await db.query(`select marketing_tester_expires_at from user_profiles where user_id='${student}'`)).rows[0].marketing_tester_expires_at, null);
    assert.equal((await db.query(`select marketing_tester_expires_at from user_profiles where user_id='${tester}'`)).rows[0].marketing_tester_expires_at, null);
    await assert.rejects(db.exec(`select set_marketing_tester_access('${admin}','${tester}',now()+interval '90 days')`), /permission denied/);
    await assert.rejects(db.query('select * from marketing_tester_access_log'), /permission denied/);
    await db.exec(`reset role; set role service_role; select set_config('request.jwt.claim.role','service_role',false);`);
    await assert.rejects(db.exec(`select set_marketing_tester_access('${tester}','${student}',now()+interval '90 days')`), /forbidden/);
    await assert.rejects(db.exec(`select set_marketing_tester_access('${admin}','${tester}',now()+interval '500 days')`), /invalid_expiry/);
    await db.exec(`select set_marketing_tester_access('${admin}','${tester}',now()+interval '90 days');`);
    let profile = (await db.query(`select * from user_profiles where user_id='${tester}'`)).rows[0];
    assert.ok(profile.marketing_tester_expires_at); assert.equal(profile.is_admin, false); assert.equal(profile.is_premium, false);
    await db.exec(`select set_marketing_tester_access('${admin}','${tester}',null);`);
    profile = (await db.query(`select * from user_profiles where user_id='${tester}'`)).rows[0];
    assert.equal(profile.marketing_tester_expires_at, null);
    assert.equal((await db.query('select * from marketing_tester_access_log')).rows.length, 2);
    await assert.rejects(db.exec(`select set_marketing_tester_access('${admin}','${admin}',now()+interval '90 days')`), /tester_not_found/);
  } finally { await db.close(); }
});
