// Pure resolution helpers are exercised with an in-memory Supabase query adapter.
export const SECTIONS = { vr: 'verbal_reasoning', dm: 'decision_making', qr: 'quantitative_reasoning', sj: 'situational_judgement' };
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const sorted = (rows) => [...(rows || [])].sort((a,b) => (a.order_index ?? 0)-(b.order_index ?? 0) || String(a.id).localeCompare(String(b.id)));
export function unwrap(result) { if (result.error) throw result.error; return result.data; }
async function one(client, table, id) { return unwrap(await client.from(table).select('*').eq('id', id).maybeSingle()); }
async function related(client, table, column, id) {
  const result = [];
  for (let page=0; ;page++) {
    const rows = unwrap(await client.from(table).select('*').eq(column,id).order('id').range(page*500,page*500+499)) || [];
    result.push(...rows);
    if (rows.length<500) return sorted(result);
  }
}
export function mapQuestion(section, mode, question, parent, children={}) {
  const q = question;
  const common = {
    id: q.id, section, mode, title: q.title || parent?.title || '',
    questionText: q.question_text ?? q.stem ?? '', answer: q.correct_answer,
    explanation: q.answer_reason, difficulty: q.difficulty,
    testId: q.test_id ?? parent?.test_id ?? null,
    current: true, question: q, parent: parent || null,
  };
  if (section==='dm') return {
    ...common, type: q.type, stem:q.stem, tableData:q.table_data,
    stimulusDiagram:q.stimulus_diagram, stimulusVennGeometry:q.venn_geometry,
    hideLabels:q.hide_labels ?? false,
    options:sorted(children.options).map(o=>({...o,text:o.option_text ?? '',vennConfig:o.option_data,vennGeometry:o.venn_geometry})),
    statements:sorted(children.statements).map(s=>({...s,text:s.statement_text,answer:s.correct_answer,reason:s.answer_reason})),
    subtype:q.stimulus_diagram ? 'interpret_diagram' : children.options?.some(o=>o.option_data) ? 'select_diagram' : null,
    answeringReason:q.answer_reason,
  };
  return {
    ...common, options:q.options ?? [],
    context:parent?.body ?? '', stimulus:parent?.stimulus ?? null,
    labelSet:q.label_set ?? 1, type:section==='sj' ? 'judgement' : section==='qr' ? 'quantitative' : 'verbal',
  };
}
export async function resolveContent(client, evidence, catalogue={lessons:{},questions:{}}) {
  const {kind,section,mode,content_id:id} = evidence;
  if (kind==='question') {
    if (!SECTIONS[section]) return {kind,available:false,reason:'The report has no recognised section. Captured text is shown in evidence.'};
    if (mode==='preview') return {kind,available:false,reason:'This question came from a developer preview. Its content was not published to the live question tables.'};
    const bundled = catalogue.questions?.[`${section}:${id}`];
    if (bundled && (mode==='demo' || !UUID.test(id || ''))) {
      return {kind,available:true,provenance:'Current bundled app content',catalogue:catalogue.provenance,question:bundled};
    }
    if (!['practice','timed'].includes(mode) || !UUID.test(id || '')) {
      return {kind,available:false,reason:'This question ID or mode cannot be resolved safely. Captured text is shown in evidence.'};
    }
    const base = `${mode==='timed'?'timed_':''}${SECTIONS[section]}`;
    const table = `${base}_questions`;
    const question = await one(client,table,id);
    if (!question) return {kind,available:false,reason:'The current question is deleted or unavailable.',table};
    let parent=null, children={};
    if (section==='dm') {
      const [options,statements] = await Promise.all([
        related(client,`${base}_question_options`,'question_id',id),
        related(client,`${base}_question_statements`,'question_id',id),
      ]);
      children={options,statements};
    } else {
      const [suffix,fk] = section==='vr' ? ['passages','passage_id'] : section==='qr' ? ['sets','set_id'] : ['scenarios','scenario_id'];
      parent = question[fk] ? await one(client,`${base}_${suffix}`,question[fk]) : null;
    }
    const warnings=section!=='dm' && !parent ? ['The parent passage, scenario or stimulus is unavailable.'] : [];
    const currentTestId=question.test_id ?? parent?.test_id;
    if (mode==='timed' && evidence.raw?.test_id!=null && currentTestId!=null && Number(evidence.raw.test_id)!==Number(currentTestId))
      warnings.push('The report’s test number differs from the current question’s test. The exact question ID and timed table were used.');
    return {kind,available:true,table,provenance:'Current database content',warnings,
      question:mapQuestion(section,mode,question,parent,children)};
  }
  if (kind==='lesson') {
    const lesson=catalogue.lessons?.[`${section}:${id}`];
    return lesson ? {kind,available:true,lesson,provenance:'Current bundled app lesson',catalogue:catalogue.provenance}
      : {kind,available:false,reason:'This lesson ID is absent from the bundled app catalogue. It may belong to an older app version.'};
  }
  if (kind.startsWith('forum_')) {
    if (!UUID.test(id || '')) return {kind,available:false,reason:'Invalid forum target ID.'};
    const type=kind.slice(6);
    const table={post:'forum_posts',reply:'forum_replies',member:'forum_members'}[type];
    if (!table) return {kind,available:false,reason:'Unsupported forum target.'};
    const target=await one(client,table,id);
    if (!target) return {kind,available:false,reason:'The forum content was deleted or is unavailable.'};
    const post=type==='reply' ? await one(client,'forum_posts',target.post_id) : type==='post'?target:null;
    const [replies,attachments] = post ? await Promise.all([
      related(client,'forum_replies','post_id',post.id),related(client,'forum_attachments','post_id',post.id),
    ]) : [[],[]];
    // Media is fetched separately after the same admin check, never via a public bucket.
    replies.sort((a,b)=>String(a.created_at).localeCompare(String(b.created_at))||String(a.id).localeCompare(String(b.id)));
    return {kind,available:true,target,post,replies,attachments,provenance:'Current forum content'};
  }
  if(kind==='ai')return {kind,available:false,reason:'No question ID was captured for this tutor request. Review the captured evidence below.'};
  return {kind,available:true,provenance:'Original support message'};
}

export function sentryLink(evidence, baseUrl) {
  if (!baseUrl) return null;
  let url; try { url=new URL(baseUrl); } catch { return null; }
  if (url.protocol!=='https:' || !/(^|\.)sentry\.io$/.test(url.hostname)) return null;
  const event=evidence.raw?.diagnostics?.sentry_event_id;
  const query=typeof event==='string' && /^[a-f0-9]{32}$/i.test(event) ? `id:${event}` :
    evidence.content_id && UUID.test(evidence.content_id) ? `"${evidence.content_id}"` : evidence.source==='ai' ? 'ai-tutor' : '';
  if (query) url.searchParams.set('query',query);
  return url.href;
}
