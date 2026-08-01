interface Env {
  DB: D1Database
  IMAGES: R2Bucket
}

export const onRequest: PagesFunction<Env> = async (ctx) => {
  const url = new URL(ctx.request.url)

  // Allow login and public routes without auth
  if (url.pathname === '/api/auth/login') {
    return ctx.next()
  }

  // Skip auth check for non-API routes (static assets)
  if (!url.pathname.startsWith('/api/')) {
    return ctx.next()
  }

  const token = ctx.request.headers.get('Authorization')?.replace('Bearer ', '')
  if (!token) {
    return Response.json({ error: 'No autorizado' }, { status: 401 })
  }

  const session = await ctx.env.DB.prepare(
    'SELECT s.user_id, u.nombre, u.apellido, u.rol, u.permisos, u.can_publish, u.can_delete_bitacora FROM sessions s JOIN users u ON s.user_id = u.id WHERE s.token = ? AND s.expires_at > datetime("now")'
  ).bind(token).first()

  if (!session) {
    return Response.json({ error: 'Sesión inválida o expirada' }, { status: 401 })
  }

  ctx.data.user = session
  ctx.data.token = token
  return ctx.next()
}
