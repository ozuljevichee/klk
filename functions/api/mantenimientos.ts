interface Env { DB: D1Database }

async function buildMant(db: D1Database, m: Record<string, unknown>) {
  const { results: accesorios } = await db.prepare(
    'SELECT * FROM mant_accesorios WHERE mant_id = ?'
  ).bind(m.id).all()
  const { results: auditoria } = await db.prepare(
    'SELECT * FROM mant_auditoria WHERE mant_id = ? ORDER BY created_at'
  ).bind(m.id).all()

  return {
    id: m.id,
    equipoNombre: m.equipo_nombre,
    equipoCodigo: m.equipo_codigo,
    fecha: m.fecha,
    proximoMant: m.proximo_mant,
    descripcion: m.descripcion,
    responsable: m.responsable,
    imagen: m.imagen,
    nroFactura: m.nro_factura,
    facturaImg: m.factura_img,
    creadoPor: m.creado_por,
    fechaCreacion: m.fecha_creacion,
    horaCreacion: m.hora_creacion,
    userId: m.user_id,
    deleted: m.deleted === 1,
    deletedBy: m.deleted_by,
    deletedAt: m.deleted_at,
    accesorios: accesorios.map((a: Record<string, unknown>) => ({
      nombre: a.nombre, codigo: a.codigo, cantidad: a.cantidad,
    })),
    auditoria: auditoria.map((a: Record<string, unknown>) => ({
      usuario: a.usuario, accion: a.accion, fecha: a.fecha, hora: a.hora, detalle: a.detalle,
    })),
  }
}

export const onRequestGet: PagesFunction<Env> = async (ctx) => {
  const { results } = await ctx.env.DB.prepare('SELECT * FROM mantenimientos ORDER BY created_at DESC').all()
  const items = await Promise.all(results.map(m => buildMant(ctx.env.DB, m as Record<string, unknown>)))
  return Response.json(items)
}

export const onRequestPost: PagesFunction<Env> = async (ctx) => {
  const b = await ctx.request.json() as Record<string, unknown>

  await ctx.env.DB.prepare(
    `INSERT INTO mantenimientos (id, equipo_nombre, equipo_codigo, fecha, proximo_mant, descripcion, responsable, imagen, nro_factura, factura_img, creado_por, fecha_creacion, hora_creacion, user_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    b.id, b.equipoNombre, b.equipoCodigo, b.fecha, b.proximoMant, b.descripcion,
    b.responsable, b.imagen ?? null, b.nroFactura ?? null, b.facturaImg ?? null,
    b.creadoPor, b.fechaCreacion, b.horaCreacion, b.userId ?? null
  ).run()

  for (const a of (b.accesorios as Record<string, unknown>[] ?? [])) {
    await ctx.env.DB.prepare(
      'INSERT INTO mant_accesorios (mant_id, nombre, codigo, cantidad) VALUES (?, ?, ?, ?)'
    ).bind(b.id, a.nombre, a.codigo, a.cantidad).run()
  }

  if ((b.auditoria as unknown[])?.length) {
    const a = (b.auditoria as Record<string, unknown>[])[0]
    await ctx.env.DB.prepare(
      'INSERT INTO mant_auditoria (mant_id, usuario, accion, fecha, hora, detalle) VALUES (?, ?, ?, ?, ?, ?)'
    ).bind(b.id, a.usuario, a.accion, a.fecha, a.hora, a.detalle ?? null).run()
  }

  const mant = await ctx.env.DB.prepare('SELECT * FROM mantenimientos WHERE id = ?').bind(b.id).first()
  return Response.json(await buildMant(ctx.env.DB, mant as Record<string, unknown>), { status: 201 })
}

export const onRequestPut: PagesFunction<Env> = async (ctx) => {
  const b = await ctx.request.json() as Record<string, unknown>

  await ctx.env.DB.prepare(
    `UPDATE mantenimientos SET equipo_nombre=?, equipo_codigo=?, fecha=?, proximo_mant=?, descripcion=?, responsable=?, imagen=?, nro_factura=?, factura_img=?, deleted=?, deleted_by=?, deleted_at=? WHERE id=?`
  ).bind(
    b.equipoNombre, b.equipoCodigo, b.fecha, b.proximoMant, b.descripcion,
    b.responsable, b.imagen ?? null, b.nroFactura ?? null, b.facturaImg ?? null,
    b.deleted ? 1 : 0, b.deletedBy ?? null, b.deletedAt ?? null, b.id
  ).run()

  await ctx.env.DB.prepare('DELETE FROM mant_accesorios WHERE mant_id = ?').bind(b.id).run()
  for (const a of (b.accesorios as Record<string, unknown>[] ?? [])) {
    await ctx.env.DB.prepare(
      'INSERT INTO mant_accesorios (mant_id, nombre, codigo, cantidad) VALUES (?, ?, ?, ?)'
    ).bind(b.id, a.nombre, a.codigo, a.cantidad).run()
  }

  await ctx.env.DB.prepare('DELETE FROM mant_auditoria WHERE mant_id = ?').bind(b.id).run()
  for (const a of (b.auditoria as Record<string, unknown>[] ?? [])) {
    await ctx.env.DB.prepare(
      'INSERT INTO mant_auditoria (mant_id, usuario, accion, fecha, hora, detalle) VALUES (?, ?, ?, ?, ?, ?)'
    ).bind(b.id, a.usuario, a.accion, a.fecha, a.hora, a.detalle ?? null).run()
  }

  const mant = await ctx.env.DB.prepare('SELECT * FROM mantenimientos WHERE id = ?').bind(b.id).first()
  return Response.json(await buildMant(ctx.env.DB, mant as Record<string, unknown>))
}

export const onRequestDelete: PagesFunction<Env> = async (ctx) => {
  const url = new URL(ctx.request.url)
  const id = url.searchParams.get('id')
  if (!id) return Response.json({ error: 'id requerido' }, { status: 400 })
  await ctx.env.DB.prepare('DELETE FROM mantenimientos WHERE id = ?').bind(id).run()
  return Response.json({ ok: true })
}
