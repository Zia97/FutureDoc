// Cursor pagination avoids Supabase's default 1,000-row ceiling. Factories
// must retain the authenticated user filter on EVERY page.
export async function readAllPages(makeQuery, pageSize = 500) {
  const rows = [];
  let after = null;
  for (;;) {
    let query = makeQuery().order('id', { ascending: true }).limit(pageSize);
    if (after != null) query = query.gt('id', after);
    const { data, error } = await query;
    if (error) throw error;
    rows.push(...(data ?? []));
    if (!data?.length || data.length < pageSize) return rows;
    const next = data[data.length - 1].id;
    if (next === after) throw new Error('Performance pagination did not advance');
    after = next;
  }
}
