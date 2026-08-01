interface Env { DB: D1Database }

export const onRequestPost: PagesFunction<Env> = async (ctx) => {
  const token = ctx.request.headers.get('Authorization')?.replace('Bearer ', '')
  if (token) {
    await ctx.env.DB.prepare('DELETE FROM sessions WHERE token = ?').bind(token).run()
  }
  return Response.json({ ok: true })
}
