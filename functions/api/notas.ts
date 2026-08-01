interface Env { DB: D1Database }

export const onRequestGet: PagesFunction<Env> = async (ctx) => {
  const user = ctx.data.user as { user_id: number }
  const { results } = await ctx.env.DB.prepare(
    'SELECT * FROM notas WHERE user_id = ? ORDER BY created_at DESC'
  ).bind(user.user_id).all()

  return Response.json(results.map((n: Record<string, unknown>) => ({
    id: n.id, text: n.text, done: n.done === 1, at: n.at, dueDate: n.due_date,
  })))
}

export const onRequestPost: PagesFunction<Env> = async (ctx) => {
  const user = ctx.data.user as { user_id: number }
  const b = await ctx.request.json() as Record<string, unknown>
  const result = await ctx.env.DB.prepare(
    'INSERT INTO notas (user_id, text, done, at, due_date) VALUES (?, ?, ?, ?, ?)'
  ).bind(user.user_id, b.text, b.done ? 1 : 0, b.at, b.dueDate ?? null).run()

  return Response.json({ id: result.meta.last_row_id, ...b }, { status: 201 })
}

export const onRequestPut: PagesFunction<Env> = async (ctx) => {
  const user = ctx.data.user as { user_id: number }
  const b = await ctx.request.json() as Record<string, unknown>
  await ctx.env.DB.prepare(
    'UPDATE notas SET text=?, done=?, due_date=? WHERE id=? AND user_id=?'
  ).bind(b.text, b.done ? 1 : 0, b.dueDate ?? null, b.id, user.user_id).run()
  return Response.json({ ok: true })
}

export const onRequestDelete: PagesFunction<Env> = async (ctx) => {
  const user = ctx.data.user as { user_id: number }
  const url = new URL(ctx.request.url)
  const id = url.searchParams.get('id')
  if (!id) return Response.json({ error: 'id requerido' }, { status: 400 })
  await ctx.env.DB.prepare('DELETE FROM notas WHERE id = ? AND user_id = ?').bind(id, user.user_id).run()
  return Response.json({ ok: true })
}
