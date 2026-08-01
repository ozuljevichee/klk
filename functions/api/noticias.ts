interface Env { DB: D1Database }

export const onRequestGet: PagesFunction<Env> = async (ctx) => {
  const { results } = await ctx.env.DB.prepare('SELECT * FROM noticias ORDER BY created_at DESC').all()
  return Response.json(results.map((n: Record<string, unknown>) => ({
    id: n.id, titulo: n.titulo, cuerpo: n.cuerpo, autor: n.autor,
    rol: n.rol, fecha: n.fecha, tipo: n.tipo, imagen: n.imagen,
  })))
}

export const onRequestPost: PagesFunction<Env> = async (ctx) => {
  const b = await ctx.request.json() as Record<string, unknown>
  const result = await ctx.env.DB.prepare(
    'INSERT INTO noticias (titulo, cuerpo, autor, rol, fecha, tipo, imagen) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).bind(b.titulo, b.cuerpo, b.autor, b.rol, b.fecha, b.tipo, b.imagen ?? null).run()

  const noticia = await ctx.env.DB.prepare('SELECT * FROM noticias WHERE id = ?').bind(result.meta.last_row_id).first()
  return Response.json(noticia, { status: 201 })
}

export const onRequestDelete: PagesFunction<Env> = async (ctx) => {
  const url = new URL(ctx.request.url)
  const id = url.searchParams.get('id')
  if (!id) return Response.json({ error: 'id requerido' }, { status: 400 })
  await ctx.env.DB.prepare('DELETE FROM noticias WHERE id = ?').bind(id).run()
  return Response.json({ ok: true })
}
