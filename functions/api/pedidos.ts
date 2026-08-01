interface Env { DB: D1Database }

async function buildPedido(db: D1Database, p: Record<string, unknown>) {
  const { results: bitacora } = await db.prepare(
    'SELECT * FROM pedido_bitacora WHERE pedido_id = ? ORDER BY created_at'
  ).bind(p.id).all()
  const { results: auditoria } = await db.prepare(
    'SELECT * FROM pedido_auditoria WHERE pedido_id = ? ORDER BY created_at'
  ).bind(p.id).all()

  return {
    id: p.id,
    empresa: p.empresa,
    oc: p.oc,
    material: p.material,
    pesoUnitKg: p.peso_unit_kg,
    cantidad: p.cantidad,
    totalKg: p.total_kg,
    fechaInicio: p.fecha_inicio,
    fechaFin: p.fecha_fin,
    estado: p.estado,
    solicitante: p.solicitante,
    fechaCreacion: p.fecha_creacion,
    userId: p.user_id,
    deleted: p.deleted === 1,
    deletedBy: p.deleted_by,
    deletedAt: p.deleted_at,
    bitacora: bitacora.map((b: Record<string, unknown>) => ({
      id: b.id, fecha: b.fecha, hora: b.hora, tipo: b.tipo,
      descripcion: b.descripcion, usuario: b.usuario, imagen: b.imagen,
    })),
    auditoria: auditoria.map((a: Record<string, unknown>) => ({
      usuario: a.usuario, accion: a.accion, fecha: a.fecha, hora: a.hora, detalle: a.detalle,
    })),
  }
}

export const onRequestGet: PagesFunction<Env> = async (ctx) => {
  const { results } = await ctx.env.DB.prepare('SELECT * FROM pedidos ORDER BY created_at DESC').all()
  const pedidos = await Promise.all(results.map(p => buildPedido(ctx.env.DB, p as Record<string, unknown>)))
  return Response.json(pedidos)
}

export const onRequestPost: PagesFunction<Env> = async (ctx) => {
  const b = await ctx.request.json() as Record<string, unknown>
  const log = (b.bitacora as unknown[])?.[0] as Record<string, unknown> | undefined

  await ctx.env.DB.prepare(
    `INSERT INTO pedidos (id, empresa, oc, material, peso_unit_kg, cantidad, total_kg, fecha_inicio, fecha_fin, estado, solicitante, fecha_creacion, user_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    b.id, b.empresa, b.oc ?? '', b.material, b.pesoUnitKg, b.cantidad, b.totalKg,
    b.fechaInicio, b.fechaFin, b.estado ?? 'ingresado', b.solicitante ?? '',
    b.fechaCreacion, b.userId ?? null
  ).run()

  if (log) {
    await ctx.env.DB.prepare(
      'INSERT INTO pedido_bitacora (pedido_id, fecha, hora, tipo, descripcion, usuario, imagen) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).bind(b.id, log.fecha, log.hora, log.tipo, log.descripcion, log.usuario, log.imagen ?? null).run()
  }

  const pedido = await ctx.env.DB.prepare('SELECT * FROM pedidos WHERE id = ?').bind(b.id).first()
  return Response.json(await buildPedido(ctx.env.DB, pedido as Record<string, unknown>), { status: 201 })
}

export const onRequestPut: PagesFunction<Env> = async (ctx) => {
  const b = await ctx.request.json() as Record<string, unknown>

  await ctx.env.DB.prepare(
    `UPDATE pedidos SET empresa=?, oc=?, material=?, peso_unit_kg=?, cantidad=?, total_kg=?, fecha_inicio=?, fecha_fin=?, estado=?, solicitante=?, deleted=?, deleted_by=?, deleted_at=? WHERE id=?`
  ).bind(
    b.empresa, b.oc ?? '', b.material, b.pesoUnitKg, b.cantidad, b.totalKg,
    b.fechaInicio, b.fechaFin, b.estado, b.solicitante ?? '',
    b.deleted ? 1 : 0, b.deletedBy ?? null, b.deletedAt ?? null,
    b.id
  ).run()

  // Sync bitacora: delete and re-insert
  await ctx.env.DB.prepare('DELETE FROM pedido_bitacora WHERE pedido_id = ?').bind(b.id).run()
  for (const log of (b.bitacora as Record<string, unknown>[] ?? [])) {
    await ctx.env.DB.prepare(
      'INSERT INTO pedido_bitacora (pedido_id, fecha, hora, tipo, descripcion, usuario, imagen) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).bind(b.id, log.fecha, log.hora, log.tipo, log.descripcion, log.usuario, log.imagen ?? null).run()
  }

  // Sync auditoria: delete and re-insert
  await ctx.env.DB.prepare('DELETE FROM pedido_auditoria WHERE pedido_id = ?').bind(b.id).run()
  for (const a of (b.auditoria as Record<string, unknown>[] ?? [])) {
    await ctx.env.DB.prepare(
      'INSERT INTO pedido_auditoria (pedido_id, usuario, accion, fecha, hora, detalle) VALUES (?, ?, ?, ?, ?, ?)'
    ).bind(b.id, a.usuario, a.accion, a.fecha, a.hora, a.detalle ?? null).run()
  }

  const pedido = await ctx.env.DB.prepare('SELECT * FROM pedidos WHERE id = ?').bind(b.id).first()
  return Response.json(await buildPedido(ctx.env.DB, pedido as Record<string, unknown>))
}

export const onRequestDelete: PagesFunction<Env> = async (ctx) => {
  const url = new URL(ctx.request.url)
  const id = url.searchParams.get('id')
  if (!id) return Response.json({ error: 'id requerido' }, { status: 400 })
  await ctx.env.DB.prepare('DELETE FROM pedidos WHERE id = ?').bind(id).run()
  return Response.json({ ok: true })
}
