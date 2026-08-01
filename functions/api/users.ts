interface Env { DB: D1Database }

function mapUser(u: Record<string, unknown>) {
  return {
    id: u.id,
    nombre: u.nombre,
    apellido: u.apellido,
    usuario: u.usuario,
    password: u.password,
    rol: u.rol,
    departamento: u.departamento,
    email: u.email,
    telefono: u.telefono,
    fechaIngreso: u.fecha_ingreso,
    cumpleanos: u.cumpleanos,
    avatar: u.avatar,
    permisos: JSON.parse(u.permisos as string),
    activo: u.activo === 1,
    foto: u.foto,
    canPublish: u.can_publish === 1,
    canDeleteBitacora: u.can_delete_bitacora === 1,
    contactoEmergencia: u.contacto_emergencia_nombre
      ? { nombre: u.contacto_emergencia_nombre, telefono: u.contacto_emergencia_telefono }
      : undefined,
  }
}

export const onRequestGet: PagesFunction<Env> = async (ctx) => {
  const { results } = await ctx.env.DB.prepare('SELECT * FROM users ORDER BY id').all()
  return Response.json(results.map(u => mapUser(u as Record<string, unknown>)))
}

export const onRequestPost: PagesFunction<Env> = async (ctx) => {
  const b = await ctx.request.json() as Record<string, unknown>
  const avatar = `${String(b.nombre).charAt(0)}${String(b.apellido).charAt(0)}`.toUpperCase()

  const result = await ctx.env.DB.prepare(
    `INSERT INTO users (nombre, apellido, usuario, password, rol, departamento, email, telefono, fecha_ingreso, cumpleanos, avatar, permisos, activo, foto, can_publish, can_delete_bitacora, contacto_emergencia_nombre, contacto_emergencia_telefono)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    b.nombre, b.apellido, String(b.usuario).toLowerCase(), b.password,
    b.rol, b.departamento, b.email, b.telefono ?? '',
    b.fechaIngreso ?? '', b.cumpleanos ?? '', avatar,
    JSON.stringify(b.permisos ?? []),
    b.activo ? 1 : 0, b.foto ?? null,
    b.canPublish ? 1 : 0, b.canDeleteBitacora ? 1 : 0,
    (b.contactoEmergencia as Record<string, string>)?.nombre ?? null,
    (b.contactoEmergencia as Record<string, string>)?.telefono ?? null
  ).run()

  const newUser = await ctx.env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(result.meta.last_row_id).first()
  return Response.json(mapUser(newUser as Record<string, unknown>), { status: 201 })
}

export const onRequestPut: PagesFunction<Env> = async (ctx) => {
  const b = await ctx.request.json() as Record<string, unknown>
  const avatar = `${String(b.nombre).charAt(0)}${String(b.apellido).charAt(0)}`.toUpperCase()

  await ctx.env.DB.prepare(
    `UPDATE users SET nombre=?, apellido=?, usuario=?, password=?, rol=?, departamento=?, email=?, telefono=?, fecha_ingreso=?, cumpleanos=?, avatar=?, permisos=?, activo=?, foto=?, can_publish=?, can_delete_bitacora=?, contacto_emergencia_nombre=?, contacto_emergencia_telefono=? WHERE id=?`
  ).bind(
    b.nombre, b.apellido, String(b.usuario).toLowerCase(), b.password,
    b.rol, b.departamento, b.email, b.telefono ?? '',
    b.fechaIngreso ?? '', b.cumpleanos ?? '', avatar,
    JSON.stringify(b.permisos ?? []),
    b.activo ? 1 : 0, b.foto ?? null,
    b.canPublish ? 1 : 0, b.canDeleteBitacora ? 1 : 0,
    (b.contactoEmergencia as Record<string, string>)?.nombre ?? null,
    (b.contactoEmergencia as Record<string, string>)?.telefono ?? null,
    b.id
  ).run()

  const updated = await ctx.env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(b.id).first()
  return Response.json(mapUser(updated as Record<string, unknown>))
}

export const onRequestDelete: PagesFunction<Env> = async (ctx) => {
  const url = new URL(ctx.request.url)
  const id = url.searchParams.get('id')
  if (!id) return Response.json({ error: 'id requerido' }, { status: 400 })
  await ctx.env.DB.prepare('DELETE FROM users WHERE id = ?').bind(id).run()
  return Response.json({ ok: true })
}
