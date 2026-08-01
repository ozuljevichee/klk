interface Env { DB: D1Database }

export const onRequestPost: PagesFunction<Env> = async (ctx) => {
  const { usuario, password } = await ctx.request.json() as { usuario: string; password: string }

  const user = await ctx.env.DB.prepare(
    'SELECT * FROM users WHERE usuario = ? AND password = ? AND activo = 1'
  ).bind(usuario.toLowerCase(), password).first()

  if (!user) {
    return Response.json({ error: 'Usuario o contraseña incorrectos' }, { status: 401 })
  }

  const token = crypto.randomUUID()
  const expires = new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString() // 8 hours

  await ctx.env.DB.prepare(
    'INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)'
  ).bind(token, user.id, expires).run()

  const userOut = {
    id: user.id,
    nombre: user.nombre,
    apellido: user.apellido,
    usuario: user.usuario,
    rol: user.rol,
    departamento: user.departamento,
    email: user.email,
    telefono: user.telefono,
    fechaIngreso: user.fecha_ingreso,
    cumpleanos: user.cumpleanos,
    avatar: user.avatar,
    permisos: JSON.parse(user.permisos as string),
    activo: user.activo === 1,
    foto: user.foto,
    canPublish: user.can_publish === 1,
    canDeleteBitacora: user.can_delete_bitacora === 1,
    contactoEmergencia: user.contacto_emergencia_nombre
      ? { nombre: user.contacto_emergencia_nombre, telefono: user.contacto_emergencia_telefono }
      : undefined,
  }

  return Response.json({ token, user: userOut })
}
