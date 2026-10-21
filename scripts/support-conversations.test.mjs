import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { PGlite } from '@electric-sql/pglite';
import { mergeSupportMessages } from '../src/utils/supportConversation.js';

const migration = name => fs.readFileSync(new URL(`../supabase/migrations/${name}`, import.meta.url), 'utf8');
const admin = '00000000-0000-4000-8000-000000000001';
const student = '00000000-0000-4000-8000-000000000002';
const other = '00000000-0000-4000-8000-000000000003';
const question = '00000000-0000-4000-8000-000000000004';
const parent = '00000000-0000-4000-8000-000000000005';
const sectionNames = { vr: 'verbal_reasoning', dm: 'decision_making', qr: 'quantitative_reasoning', sj: 'situational_judgement' };

test('support SQL: migration, access control, conversations, retries, unread state and question viewers', async t => {
  const db = new PGlite();
  async function as(id, role = 'authenticated') {
    await db.exec('reset role');
    await db.query("select set_config('request.jwt.claim.sub',$1,false)", [id ?? '']);
    await db.exec(`set role ${role}`);
  }
  const rpc = async (name, values = []) => (await db.query(
    `select public.${name}(${values.map((_, i) => `$${i + 1}`).join(',')}) as result`, values)).rows[0].result;
  let oldTicket, bugTicket;
  try {
    await db.exec(`create role anon; create role authenticated; create role service_role bypassrls;
      create schema auth;
      create table auth.users(id uuid primary key,email text,is_anonymous boolean default false,last_sign_in_at timestamptz,created_at timestamptz);
      create function auth.uid() returns uuid language sql as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
      create table public.user_profiles(user_id uuid primary key references auth.users(id) on delete cascade,is_admin boolean default false,display_name text);
      grant usage on schema public,auth to anon,authenticated,service_role;
      insert into auth.users(id,email) values('${admin}','admin@example.test'),('${student}','student@example.test'),('${other}','other@example.test');
      insert into user_profiles values('${admin}',true,'Admin'),('${student}',false,'Student'),('${other}',false,'Other');`);
    for (const name of ['20260408000002_create_question_reports.sql', '20260501000001_create_lesson_reports.sql',
      '20260504000005_create_support_messages.sql', '20260504000008_submit_support_message_rpc.sql']) await db.exec(migration(name));
    await db.query(`insert into support_messages(user_id,subject,message,reviewer_notes) values($1,'Old request','Original message','PRIVATE NOTE')`, [student]);
    await db.query(`insert into question_reports(user_id,question_id,section,comment) values($1,$2,'vr','Original question report')`, [student, question]);
    await db.query(`insert into lesson_reports(user_id,lesson_id,section,comment,status) values($1,'lesson-1','dm','Original lesson report','fixed')`, [student]);
    await db.exec(migration('20261020200000_support_conversations.sql'));
    await db.exec(migration('20261020201000_support_question_viewer.sql'));

    await t.test('existing messages and reports appear once; private notes and other users stay private', async () => {
      await as(student);
      const list = await rpc('support_list_tickets');
      assert.equal(list.total, 3);
      oldTicket = list.tickets.find(row => row.kind === 'support').id;
      const detail = await rpc('support_get_ticket', [oldTicket]);
      assert.equal(detail.messages.length, 1);
      assert.equal(detail.messages[0].body, 'Original message');
      assert.equal(JSON.stringify(detail).includes('PRIVATE NOTE'), false);
      assert.equal(JSON.stringify(detail).includes('student@example.test'), false);
      assert.equal((await rpc('support_inbox_counts')).unread, 0);
      await as(other);
      assert.equal((await rpc('support_list_tickets')).total, 0);
      for (const [name, args] of [
        ['support_get_ticket', [oldTicket]], ['support_get_question', [oldTicket]],
        ['support_reply', [oldTicket, 'intrusion', 'intrusion']],
        ['support_mark_read', [oldTicket, 99999]], ['support_set_status', [oldTicket, 'resolved']],
        ['support_list_tickets', [true]], ['support_get_ticket', [oldTicket, true]],
        ['support_reply', [oldTicket, 'spoof admin', 'intrusion2', true]],
      ]) await assert.rejects(rpc(name, args), /forbidden|ticket_unavailable/);
      await assert.rejects(db.query('select * from support_tickets'), /permission denied/);
      await assert.rejects(db.query('select * from support_ticket_messages'), /permission denied/);
      await assert.rejects(db.query("select support_private.import_report('support','{}')"), /permission denied/);
      await as(null, 'anon');
      await assert.rejects(rpc('support_list_tickets'), /permission denied/);
      await as(null);
      await assert.rejects(rpc('support_list_tickets'), /forbidden/);
    });

    await t.test('new requests and old clients create tickets atomically; retries are idempotent', async () => {
      await as(student);
      const args = ['Broken screen', 'The next button is covered.', 'bug', 'create-1', 'android', '1.0'];
      bugTicket = await rpc('support_create_ticket', args);
      assert.equal(await rpc('support_create_ticket', args), bugTicket);
      assert.equal((await rpc('support_get_ticket', [bugTicket])).messages.length, 1);
      assert.equal((await rpc('support_list_tickets', [false, 'all', 'bug'])).total, 1);
      await rpc('submit_support_message', ['Old client', 'Still supported']);
      assert.equal((await rpc('support_list_tickets')).total, 5);
      await assert.rejects(rpc('support_create_ticket', ['', 'text', 'support', 'bad']), /invalid_message/);
      await assert.rejects(rpc('support_create_ticket', ['subject', ' ', 'support', 'bad']), /invalid_message/);
      await assert.rejects(rpc('support_create_ticket', ['subject', 'text', 'admin', 'bad']), /invalid_message/);
      await assert.rejects(rpc('support_create_ticket', ['subject', 'x'.repeat(4001), 'support', 'bad']), /invalid_message/);
    });

    await t.test('two-way messages, read cursors, resolution and reopening persist', async () => {
      await as(admin);
      let detail = await rpc('support_get_ticket', [bugTicket, true]);
      assert.equal(detail.ticket.requester, 'Student');
      await rpc('support_mark_read', [bugTicket, detail.ticket.last_message_id, true]);
      const replyArgs = [bugTicket, 'We are investigating.', 'admin-reply-1', true];
      const first = await rpc('support_reply', replyArgs);
      assert.equal(await rpc('support_reply', replyArgs), first);
      await as(student);
      assert.equal((await rpc('support_inbox_counts')).unread, 1);
      detail = await rpc('support_get_ticket', [bugTicket]);
      assert.equal(detail.messages.at(-1).author_role, 'admin');
      assert.equal(detail.ticket.status, 'reviewing');
      await rpc('support_mark_read', [bugTicket, first]);
      await rpc('support_mark_read', [bugTicket, 0]); // older cursor cannot make a read message unread
      assert.equal((await rpc('support_inbox_counts')).unread, 0);
      await as(admin);
      const second = await rpc('support_reply', [bugTicket, 'Now fixed.', 'admin-reply-2', true]);
      await as(student);
      await rpc('support_mark_read', [bugTicket, first]); // a racing new arrival stays unread
      assert.equal((await rpc('support_inbox_counts')).unread, 1);
      await rpc('support_mark_read', [bugTicket, second]);
      await as(admin);
      await rpc('support_set_status', [bugTicket, 'resolved']);
      await as(student);
      detail = await rpc('support_get_ticket', [bugTicket]);
      assert.equal(detail.ticket.status, 'resolved');
      assert.equal(detail.messages.at(-1).author_role, 'system');
      await rpc('support_reply', [bugTicket, 'It still happens.', 'user-reply-1']);
      assert.equal((await rpc('support_get_ticket', [bugTicket])).ticket.status, 'open');
      await as(admin);
      assert.ok((await rpc('support_list_tickets', [true, 'unread'])).tickets.some(row => row.id === bugTicket));
      await db.exec('reset role');
      const row = (await db.query(`select s.status from support_messages s join support_tickets t on t.source_id=s.id where t.id=$1`, [bugTicket])).rows[0];
      assert.equal(row.status, 'new');
      await db.query(`update support_messages set status='resolved' where id=(select source_id from support_tickets where id=$1)`, [bugTicket]);
      await as(student);
      assert.equal((await rpc('support_get_ticket', [bugTicket])).ticket.status, 'resolved');
    });

    await t.test('profile and support stay unread until each ticket with an admin reply has been read', async () => {
      await as(student);
      for (const id of [bugTicket, oldTicket]) {
        const detail = await rpc('support_get_ticket', [id]);
        await rpc('support_mark_read', [id, detail.ticket.last_message_id]);
      }
      await as(admin);
      const firstReply = await rpc('support_reply', [bugTicket, 'Update on the bug.', 'badge-bug', true]);
      const secondReply = await rpc('support_reply', [oldTicket, 'Update on your request.', 'badge-request', true]);
      await as(student);
      assert.equal((await rpc('support_inbox_counts')).unread, 2);
      assert.equal((await rpc('support_list_tickets', [false, 'unread'])).total, 2);
      await rpc('support_mark_read', [bugTicket, firstReply]);
      assert.equal((await rpc('support_inbox_counts')).unread, 1);
      const remaining = await rpc('support_list_tickets', [false, 'unread']);
      assert.deepEqual(remaining.tickets.map(ticket => ticket.id), [oldTicket]);
      await rpc('support_mark_read', [oldTicket, secondReply]);
      assert.equal((await rpc('support_inbox_counts')).unread, 0);
      assert.equal((await rpc('support_list_tickets', [false, 'unread'])).total, 0);
    });

    await t.test('message paging has no gaps; invalid writes never change history', async () => {
      await as(student);
      for (let i = 0; i < 56; i++) await rpc('support_reply', [bugTicket, `Message ${i}`, `page-${i}`]);
      const latest = await rpc('support_get_ticket', [bugTicket]);
      assert.equal(latest.messages.length, 50);
      assert.equal(latest.has_older, true);
      const older = await rpc('support_get_ticket', [bugTicket, false, latest.messages[0].id]);
      assert.equal(older.has_older, false);
      const ids = [...older.messages, ...latest.messages].map(row => row.id);
      assert.equal(new Set(ids).size, ids.length);
      assert.ok(older.messages.at(-1).id < latest.messages[0].id);
      await assert.rejects(rpc('support_reply', [bugTicket, ' ', 'invalid']), /invalid_message/);
      await assert.rejects(rpc('support_reply', [bugTicket, 'x'.repeat(4001), 'invalid']), /invalid_message/);
      await assert.rejects(rpc('support_reply', [bugTicket, 'valid', null]), /invalid_message/);
      assert.equal((await rpc('support_get_ticket', [bugTicket])).ticket.last_message_id, latest.ticket.last_message_id);
    });

    await t.test('ticket pagination returns every row once and keeps owner filtering on every page', async () => {
      await as(student);
      for (let i = 0; i < 31; i++) await rpc('support_create_ticket', [`Ticket ${i}`, 'Test message', 'support', `list-page-${i}`]);
      const first = await rpc('support_list_tickets', [false, 'all', 'all', 0]);
      const second = await rpc('support_list_tickets', [false, 'all', 'all', 1]);
      assert.equal(first.tickets.length, 30);
      assert.equal(first.total, 36);
      assert.equal(second.tickets.length, 6);
      assert.equal(new Set([...first.tickets, ...second.tickets].map(row => row.id)).size, 36);
      await as(other);
      assert.equal((await rpc('support_list_tickets', [false, 'all', 'all', 1])).total, 0);
      await assert.rejects(rpc('support_list_tickets', [false, 'all', 'all', -1]), /invalid_filter/);
    });

    await t.test('exact practice and timed questions resolve in all sections, with timed answers withheld by the server', async () => {
      await db.exec('reset role');
      for (const [section, name] of Object.entries(sectionNames)) {
        for (const timed of [false, true]) {
          const base = `${timed ? 'timed_' : ''}${name}`;
          const suffix = { vr: 'passages', qr: 'sets', sj: 'scenarios' }[section];
          await db.exec(`create table ${base}_questions(id uuid primary key,question_text text,stem text,correct_answer text,answer_reason text,
            test_id integer,passage_id uuid,set_id uuid,scenario_id uuid,options jsonb,type text,label_set integer);
            insert into ${base}_questions values('${question}','${base} question','${base} stem','B','SECRET explanation',
              ${section === 'dm' && timed ? 1 : 'null'},'${parent}','${parent}','${parent}','["A","B"]','logic_puzzle',2);`);
          if (suffix) await db.exec(`create table ${base}_${suffix}(id uuid primary key,body text,stimulus jsonb,test_id integer,label_set integer);
            insert into ${base}_${suffix} values('${parent}','${base} context','{"type":"text","text":"chart"}',1,1);`);
          if (section === 'dm') await db.exec(`create table ${base}_question_options(id uuid default gen_random_uuid(),question_id uuid,label text,option_text text,
            option_data jsonb,order_index integer,venn_geometry jsonb);
            create table ${base}_question_statements(id uuid default gen_random_uuid(),question_id uuid,statement_text text,correct_answer text,answer_reason text,order_index integer);
            insert into ${base}_question_options(question_id,label,option_text,order_index) values('${question}','B','Option B',0);
            insert into ${base}_question_statements(question_id,statement_text,correct_answer,answer_reason,order_index)
              values('${question}','Statement','Yes','SECRET statement explanation',0);`);
          if (timed) await db.exec(`create table ${base}_exam_attempts(user_id uuid,test_id integer,submitted_at timestamptz default now());`);
          // Deliberately falsify the report's test ID: answer access must use the real parent.
          const report = (await db.query(`insert into question_reports(user_id,question_id,section,is_timed,test_id,comment)
            values($1,$2,$3,$4,99,'Reported') returning id`, [student, question, section, timed])).rows[0].id;
          const ticket = (await db.query('select id from support_tickets where source_id=$1', [report])).rows[0].id;
          await as(student);
          const view = await rpc('support_get_question', [ticket]);
          assert.equal(view.available, true);
          assert.equal(view.question.stem, `${base} stem`);
          assert.equal(view.answers_visible, !timed);
          if (section !== 'dm') assert.equal(view.question.context, `${base} context`);
          if (timed) {
            assert.equal(view.question.answer, null);
            assert.equal(JSON.stringify(view).includes('SECRET'), false);
            await db.exec('reset role');
            await db.query(`insert into ${base}_exam_attempts(user_id,test_id) values($1,99)`, [student]);
            await as(student);
            assert.equal((await rpc('support_get_question', [ticket])).answers_visible, false);
            await as(admin);
            assert.equal((await rpc('support_get_question', [ticket, true])).question.answer, 'B');
            await db.exec('reset role');
            await db.query(`insert into ${base}_exam_attempts(user_id,test_id) values($1,1)`, [student]);
            await as(student);
            assert.equal((await rpc('support_get_question', [ticket])).question.answer, 'B');
          }
          await as(other);
          await assert.rejects(rpc('support_get_question', [ticket]), /ticket_unavailable/);
          await db.exec('reset role');
          await db.query(`delete from ${base}_questions where id=$1`, [question]);
          await as(student);
          assert.equal((await rpc('support_get_question', [ticket])).available, false);
          await db.exec('reset role');
        }
      }
    });

    await t.test('revoked administrators lose access immediately; deleted accounts retain admin history', async () => {
      await db.exec('reset role');
      await db.query('update user_profiles set is_admin=false where user_id=$1', [admin]);
      await as(admin);
      assert.equal((await rpc('support_inbox_counts')).is_admin, false);
      await assert.rejects(rpc('support_get_ticket', [bugTicket, true]), /forbidden/);
      await assert.rejects(rpc('support_reply', [bugTicket, 'No access', 'revoked', true]), /forbidden/);
      await db.exec('reset role');
      await db.query('update user_profiles set is_admin=true where user_id=$1', [admin]);
      await db.query('delete from auth.users where id=$1', [student]);
      await as(admin);
      const detail = await rpc('support_get_ticket', [bugTicket, true]);
      assert.equal(detail.ticket.can_reply, false);
      assert.ok(detail.messages.length > 0);
      await assert.rejects(rpc('support_reply', [bugTicket, 'Nobody to contact', 'deleted', true]), /account_deleted/);
    });
  } finally { await db.close(); }
});

test('conversation refresh merges overlapping history and resets safely across a missed page', () => {
  const rows = (...ids) => ids.map(id => ({ id, body: String(id) }));
  const overlap = mergeSupportMessages(rows(5, 4, 3, 2, 1), rows(4, 5, 6), 'latest');
  assert.deepEqual(overlap.messages.map(m => m.id), [6, 5, 4, 3, 2, 1]);
  assert.equal(overlap.keptHistory, true);
  const gap = mergeSupportMessages(rows(3, 2, 1), rows(6, 7, 8), 'latest');
  assert.deepEqual(gap.messages.map(m => m.id), [8, 7, 6]);
  assert.equal(gap.keptHistory, false);
  const older = mergeSupportMessages(gap.messages, rows(3, 4, 5), 'older');
  assert.deepEqual(older.messages.map(m => m.id), [8, 7, 6, 5, 4, 3]);
});
