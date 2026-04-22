// Parse the DM practice seed SQL and emit a compact JSON with everything needed
// to write new answer_reason fields.
// Usage: node scripts/parse-dm-seed.mjs > dm_questions.json

import fs from 'node:fs';
import path from 'node:path';

const SRC = path.resolve(process.argv[2] ||
  'supabase/migrations/20260422000001_seed_dm_practice_questions.sql');

const text = fs.readFileSync(SRC, 'utf8');

// Split into question blocks by the "-- [N] Title" marker
const blockRe = /-- \[(\d+)\] ([^\n]+)\n([\s\S]*?)(?=\n  -- \[\d+\] |\nEND \$\$;)/g;
const questions = [];
let m;
while ((m = blockRe.exec(text)) !== null) {
  const number = parseInt(m[1], 10);
  const title = m[2].trim();
  const body = m[3];

  // Extract id
  const idM = body.match(/'([0-9a-f-]{36})',\s*\n\s*'[^']*',/);
  const id = idM ? idM[1] : null;

  // Extract type
  const typeM = body.match(/'(\w+)'::dm_question_type/);
  const type = typeM ? typeM[1] : null;

  // Extract stem (first big string literal after the id+title)
  // The stem is the 3rd string in VALUES — skip id, title, type cast handled.
  // Extract correct_answer — comes after stimulus_diagram
  // Robust approach: look for correct_answer pattern:  '<X>',  followed by answer_reason
  // Use a regex that matches the row line-by-line.

  // Pull the INSERT into decision_making_questions VALUES (...) block
  const questionsInsertM = body.match(/INSERT INTO decision_making_questions[\s\S]*?VALUES \(([\s\S]*?)\) RETURNING id INTO v_id;/);
  const vals = questionsInsertM ? questionsInsertM[1] : '';

  // Parse the VALUES body by splitting at top-level commas.
  const cols = splitTopLevel(vals);
  // cols: id, title, type(cast), stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index, difficulty, venn_geometry
  const stem = cols[3] ? unwrapSqlString(cols[3]) : '';
  const table_data = cols[4] ? unwrapJson(cols[4]) : null;
  const stimulus_diagram = cols[5] ? unwrapJson(cols[5]) : null;
  const correct_answer = cols[6] ? unwrapSqlString(cols[6]) : null;
  const answer_reason = cols[7] ? unwrapSqlString(cols[7]) : null;
  const difficulty = cols[9] ? unwrapSqlString(cols[9]) : null;

  // Extract options
  const opts = [];
  const optRe = /INSERT INTO decision_making_question_options[\s\S]*?VALUES \(\s*v_id, '([A-D])', ([\s\S]*?)\);/g;
  let om;
  while ((om = optRe.exec(body)) !== null) {
    const label = om[1];
    // om[2] = option_text, option_data, order_index, venn_geometry
    const rest = splitTopLevel(om[2]);
    const option_text = rest[0] ? unwrapSqlString(rest[0]) : '';
    const option_data = rest[1] ? unwrapJson(rest[1]) : null;
    opts.push({ label, option_text, option_data });
  }

  // Extract statements
  const stmts = [];
  const stmtRe = /INSERT INTO decision_making_question_statements[\s\S]*?VALUES \(\s*v_id, ([\s\S]*?)\);/g;
  let sm;
  while ((sm = stmtRe.exec(body)) !== null) {
    const rest = splitTopLevel(sm[1]);
    // statement_text, correct_answer, order_index
    const statement_text = rest[0] ? unwrapSqlString(rest[0]) : '';
    const stmtAnswer = rest[1] ? unwrapSqlString(rest[1]) : null;
    const order_index = rest[2] ? parseInt(rest[2], 10) : null;
    stmts.push({ order_index, statement_text, correct_answer: stmtAnswer });
  }

  questions.push({
    number, title, id, type, difficulty,
    stem, correct_answer, answer_reason,
    options: opts,
    statements: stmts,
    table_data,
    stimulus_diagram, // venn_diagram stimulus (which letter is which region)
  });
}

process.stdout.write(JSON.stringify(questions, null, 2));

function splitTopLevel(s) {
  const out = [];
  let depth = 0;
  let inStr = false;
  let strCh = null;
  let dollarTag = null;
  let buf = '';
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    // dollar-quoted strings
    if (!inStr && !dollarTag && c === '$') {
      const tag = s.slice(i).match(/^\$([A-Za-z_]*)\$/);
      if (tag) {
        dollarTag = tag[0];
        buf += dollarTag;
        i += dollarTag.length - 1;
        continue;
      }
    }
    if (dollarTag) {
      buf += c;
      if (s.slice(i, i + dollarTag.length) === dollarTag) {
        buf += dollarTag.slice(1);
        i += dollarTag.length - 1;
        dollarTag = null;
      }
      continue;
    }
    if (inStr) {
      buf += c;
      if (c === strCh) {
        // Handle '' escape
        if (s[i + 1] === strCh) {
          buf += strCh;
          i++;
          continue;
        }
        inStr = false;
        strCh = null;
      }
      continue;
    }
    if (c === "'" || c === '"') {
      inStr = true;
      strCh = c;
      buf += c;
      continue;
    }
    if (c === '(' || c === '[' || c === '{') { depth++; buf += c; continue; }
    if (c === ')' || c === ']' || c === '}') { depth--; buf += c; continue; }
    if (c === ',' && depth === 0) {
      out.push(buf.trim());
      buf = '';
      continue;
    }
    buf += c;
  }
  if (buf.trim() !== '') out.push(buf.trim());
  return out;
}

function unwrapSqlString(s) {
  s = s.trim();
  if (s === 'NULL') return null;
  // Might end with ::something — ignore the cast
  const castIdx = s.lastIndexOf('::');
  if (castIdx > 0 && s.lastIndexOf("'") < castIdx) {
    s = s.slice(0, castIdx).trim();
  }
  if (s.startsWith("'") && s.endsWith("'")) {
    const inner = s.slice(1, -1);
    return inner.replace(/''/g, "'");
  }
  return s;
}

function unwrapJson(s) {
  s = s.trim();
  if (s === 'NULL') return null;
  // Strip trailing ::jsonb
  s = s.replace(/::jsonb$/i, '').trim();
  if (s.startsWith("'") && s.endsWith("'")) {
    const inner = s.slice(1, -1).replace(/''/g, "'");
    try { return JSON.parse(inner); } catch (e) { return inner; }
  }
  return null;
}
