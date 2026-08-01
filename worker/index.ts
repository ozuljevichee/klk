interface Env {
  DB: D1Database
  ASSETS: Fetcher
}

interface SessionUser {
  user_id: number
  nombre: string
  apellido: string
  rol: string
  permisos: string
  can_publish: number
  can_delete_bitacora: number
}

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })

const err = (msg: string, status = 400) => json({ error: msg }, status)

async function getSession(request: Request, env: Env): Promise<SessionUser | null> {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '')
  if (!token) return null
  return env.DB.prepare(
    `SELECT s.user_id, u.nombre, u.apellido, u.rol, u.permisos, u.can_publish, u.can_delete_bitacora
     FROM sessions s JOIN users u ON s.user_id = u.id
     WHERE s.token = ? AND s.expires_at > datetime('now')`
  ).bind(token).first<SessionUser>()
}

// ─── Users ────────────────────────────────────────────────────────────────────

function mapUser(u: Record<string, unknown>) {
  return {
    id: u.id, nombre: u.nombre, apellido: u.apellido, usuario: u.usuario,
    password: u.password, rol: u.rol, departamento: u.departamento,
    email: u.email, telefono: u.telefono, fechaIngreso: u.fecha_ingreso,
    cumpleanos: u.cumpleanos, avatar: u.avatar,
    permisos: JSON.parse(u.permisos as string ?? '[]'),
    activo: u.activo === 1, foto: u.foto,
    canPublish: u.can_publish === 1, canDeleteBitacora: u.can_delete_bitacora === 1,
    contactoEmergencia: u.contacto_emergencia_nombre
      ? { nombre: u.contacto_emergencia_nombre, telefono: u.contacto_emergencia_telefono }
      : undefined,
  }
}

async function handleUsers(req: Request, env: Env, url: URL, session: SessionUser): Promise<Response> {
  if (req.method === 'GET') {
    const { results } = await env.DB.prepare('SELECT * FROM users ORDER BY id').all()
    return json(results.map(u => mapUser(u as Record<string, unknown>)))
  }

  if (req.method === 'POST') {
    const b = await req.json() as Record<string, unknown>
    const avatar = `${String(b.nombre)[0]}${String(b.apellido)[0]}`.toUpperCase()
    const result = await env.DB.prepare(
      `INSERT INTO users (nombre, apellido, usuario, password, rol, departamento, email, telefono, fecha_ingreso, cumpleanos, avatar, permisos, activo, foto, can_publish, can_delete_bitacora, contacto_emergencia_nombre, contacto_emergencia_telefono)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      b.nombre, b.apellido, String(b.usuario).toLowerCase(), b.password,
      b.rol, b.departamento, b.email, b.telefono ?? '',
      b.fechaIngreso ?? '', b.cumpleanos ?? '', avatar,
      JSON.stringify(b.permisos ?? []), b.activo ? 1 : 0, b.foto ?? null,
      b.canPublish ? 1 : 0, b.canDeleteBitacora ? 1 : 0,
      (b.contactoEmergencia as Record<string, string>)?.nombre ?? null,
      (b.contactoEmergencia as Record<string, string>)?.telefono ?? null,
    ).run()
    const newUser = await env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(result.meta.last_row_id).first()
    return json(mapUser(newUser as Record<string, unknown>), 201)
  }

  if (req.method === 'PUT') {
    const b = await req.json() as Record<string, unknown>
    const avatar = `${String(b.nombre)[0]}${String(b.apellido)[0]}`.toUpperCase()
    await env.DB.prepare(
      `UPDATE users SET nombre=?, apellido=?, usuario=?, password=?, rol=?, departamento=?, email=?, telefono=?, fecha_ingreso=?, cumpleanos=?, avatar=?, permisos=?, activo=?, foto=?, can_publish=?, can_delete_bitacora=?, contacto_emergencia_nombre=?, contacto_emergencia_telefono=? WHERE id=?`
    ).bind(
      b.nombre, b.apellido, String(b.usuario).toLowerCase(), b.password,
      b.rol, b.departamento, b.email, b.telefono ?? '',
      b.fechaIngreso ?? '', b.cumpleanos ?? '', avatar,
      JSON.stringify(b.permisos ?? []), b.activo ? 1 : 0, b.foto ?? null,
      b.canPublish ? 1 : 0, b.canDeleteBitacora ? 1 : 0,
      (b.contactoEmergencia as Record<string, string>)?.nombre ?? null,
      (b.contactoEmergencia as Record<string, string>)?.telefono ?? null,
      b.id,
    ).run()
    const updated = await env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(b.id).first()
    return json(mapUser(updated as Record<string, unknown>))
  }

  if (req.method === 'DELETE') {
    const id = url.searchParams.get('id')
    if (!id) return err('id requerido')
    await env.DB.prepare('DELETE FROM users WHERE id = ?').bind(id).run()
    return json({ ok: true })
  }

  return err('Método no permitido', 405)
}

// ─── Pedidos ─────────────────────────────────────────────────────────────────

async function buildPedido(db: D1Database, p: Record<string, unknown>) {
  const { results: bitacora } = await db.prepare('SELECT * FROM pedido_bitacora WHERE pedido_id = ? ORDER BY created_at').bind(p.id).all()
  const { results: auditoria } = await db.prepare('SELECT * FROM pedido_auditoria WHERE pedido_id = ? ORDER BY created_at').bind(p.id).all()
  return {
    id: p.id, empresa: p.empresa, oc: p.oc, material: p.material,
    pesoUnitKg: p.peso_unit_kg, cantidad: p.cantidad, totalKg: p.total_kg,
    fechaInicio: p.fecha_inicio, fechaFin: p.fecha_fin, estado: p.estado,
    solicitante: p.solicitante, fechaCreacion: p.fecha_creacion, userId: p.user_id,
    deleted: p.deleted === 1, deletedBy: p.deleted_by, deletedAt: p.deleted_at,
    bitacora: bitacora.map((b: Record<string, unknown>) => ({
      id: b.id, fecha: b.fecha, hora: b.hora, tipo: b.tipo,
      descripcion: b.descripcion, usuario: b.usuario, imagen: b.imagen,
    })),
    auditoria: auditoria.map((a: Record<string, unknown>) => ({
      usuario: a.usuario, accion: a.accion, fecha: a.fecha, hora: a.hora, detalle: a.detalle,
    })),
  }
}

async function handlePedidos(req: Request, env: Env): Promise<Response> {
  if (req.method === 'GET') {
    const { results } = await env.DB.prepare('SELECT * FROM pedidos ORDER BY created_at DESC').all()
    const pedidos = await Promise.all(results.map(p => buildPedido(env.DB, p as Record<string, unknown>)))
    return json(pedidos)
  }

  if (req.method === 'POST') {
    const b = await req.json() as Record<string, unknown>
    const log = (b.bitacora as Record<string, unknown>[])?.[0]
    await env.DB.prepare(
      `INSERT INTO pedidos (id, empresa, oc, material, peso_unit_kg, cantidad, total_kg, fecha_inicio, fecha_fin, estado, solicitante, fecha_creacion, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(b.id, b.empresa, b.oc ?? '', b.material, b.pesoUnitKg, b.cantidad, b.totalKg, b.fechaInicio, b.fechaFin, b.estado ?? 'ingresado', b.solicitante ?? '', b.fechaCreacion, b.userId ?? null).run()
    if (log) {
      await env.DB.prepare('INSERT INTO pedido_bitacora (pedido_id, fecha, hora, tipo, descripcion, usuario, imagen) VALUES (?, ?, ?, ?, ?, ?, ?)').bind(b.id, log.fecha, log.hora, log.tipo, log.descripcion, log.usuario, log.imagen ?? null).run()
    }
    const pedido = await env.DB.prepare('SELECT * FROM pedidos WHERE id = ?').bind(b.id).first()
    return json(await buildPedido(env.DB, pedido as Record<string, unknown>), 201)
  }

  if (req.method === 'PUT') {
    const b = await req.json() as Record<string, unknown>
    await env.DB.prepare(
      `UPDATE pedidos SET empresa=?, oc=?, material=?, peso_unit_kg=?, cantidad=?, total_kg=?, fecha_inicio=?, fecha_fin=?, estado=?, solicitante=?, deleted=?, deleted_by=?, deleted_at=? WHERE id=?`
    ).bind(b.empresa, b.oc ?? '', b.material, b.pesoUnitKg, b.cantidad, b.totalKg, b.fechaInicio, b.fechaFin, b.estado, b.solicitante ?? '', b.deleted ? 1 : 0, b.deletedBy ?? null, b.deletedAt ?? null, b.id).run()
    await env.DB.prepare('DELETE FROM pedido_bitacora WHERE pedido_id = ?').bind(b.id).run()
    for (const log of (b.bitacora as Record<string, unknown>[] ?? [])) {
      await env.DB.prepare('INSERT INTO pedido_bitacora (pedido_id, fecha, hora, tipo, descripcion, usuario, imagen) VALUES (?, ?, ?, ?, ?, ?, ?)').bind(b.id, log.fecha, log.hora, log.tipo, log.descripcion, log.usuario, log.imagen ?? null).run()
    }
    await env.DB.prepare('DELETE FROM pedido_auditoria WHERE pedido_id = ?').bind(b.id).run()
    for (const a of (b.auditoria as Record<string, unknown>[] ?? [])) {
      await env.DB.prepare('INSERT INTO pedido_auditoria (pedido_id, usuario, accion, fecha, hora, detalle) VALUES (?, ?, ?, ?, ?, ?)').bind(b.id, a.usuario, a.accion, a.fecha, a.hora, a.detalle ?? null).run()
    }
    const pedido = await env.DB.prepare('SELECT * FROM pedidos WHERE id = ?').bind(b.id).first()
    return json(await buildPedido(env.DB, pedido as Record<string, unknown>))
  }

  return err('Método no permitido', 405)
}

// ─── Mantenimientos ───────────────────────────────────────────────────────────

async function buildMant(db: D1Database, m: Record<string, unknown>) {
  const { results: accesorios } = await db.prepare('SELECT * FROM mant_accesorios WHERE mant_id = ?').bind(m.id).all()
  const { results: auditoria } = await db.prepare('SELECT * FROM mant_auditoria WHERE mant_id = ? ORDER BY created_at').bind(m.id).all()
  return {
    id: m.id, equipoNombre: m.equipo_nombre, equipoCodigo: m.equipo_codigo,
    fecha: m.fecha, proximoMant: m.proximo_mant, descripcion: m.descripcion,
    responsable: m.responsable, imagen: m.imagen, nroFactura: m.nro_factura,
    facturaImg: m.factura_img, creadoPor: m.creado_por, fechaCreacion: m.fecha_creacion,
    horaCreacion: m.hora_creacion, userId: m.user_id,
    deleted: m.deleted === 1, deletedBy: m.deleted_by, deletedAt: m.deleted_at,
    accesorios: accesorios.map((a: Record<string, unknown>) => ({ nombre: a.nombre, codigo: a.codigo, cantidad: a.cantidad })),
    auditoria: auditoria.map((a: Record<string, unknown>) => ({ usuario: a.usuario, accion: a.accion, fecha: a.fecha, hora: a.hora, detalle: a.detalle })),
  }
}

async function handleMantenimientos(req: Request, env: Env): Promise<Response> {
  if (req.method === 'GET') {
    const { results } = await env.DB.prepare('SELECT * FROM mantenimientos ORDER BY created_at DESC').all()
    return json(await Promise.all(results.map(m => buildMant(env.DB, m as Record<string, unknown>))))
  }

  if (req.method === 'POST') {
    const b = await req.json() as Record<string, unknown>
    await env.DB.prepare(
      `INSERT INTO mantenimientos (id, equipo_nombre, equipo_codigo, fecha, proximo_mant, descripcion, responsable, imagen, nro_factura, factura_img, creado_por, fecha_creacion, hora_creacion, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(b.id, b.equipoNombre, b.equipoCodigo, b.fecha, b.proximoMant, b.descripcion, b.responsable, b.imagen ?? null, b.nroFactura ?? null, b.facturaImg ?? null, b.creadoPor, b.fechaCreacion, b.horaCreacion, b.userId ?? null).run()
    for (const a of (b.accesorios as Record<string, unknown>[] ?? [])) {
      await env.DB.prepare('INSERT INTO mant_accesorios (mant_id, nombre, codigo, cantidad) VALUES (?, ?, ?, ?)').bind(b.id, a.nombre, a.codigo, a.cantidad).run()
    }
    if ((b.auditoria as unknown[])?.length) {
      const a = (b.auditoria as Record<string, unknown>[])[0]
      await env.DB.prepare('INSERT INTO mant_auditoria (mant_id, usuario, accion, fecha, hora, detalle) VALUES (?, ?, ?, ?, ?, ?)').bind(b.id, a.usuario, a.accion, a.fecha, a.hora, a.detalle ?? null).run()
    }
    const mant = await env.DB.prepare('SELECT * FROM mantenimientos WHERE id = ?').bind(b.id).first()
    return json(await buildMant(env.DB, mant as Record<string, unknown>), 201)
  }

  if (req.method === 'PUT') {
    const b = await req.json() as Record<string, unknown>
    await env.DB.prepare(
      `UPDATE mantenimientos SET equipo_nombre=?, equipo_codigo=?, fecha=?, proximo_mant=?, descripcion=?, responsable=?, imagen=?, nro_factura=?, factura_img=?, deleted=?, deleted_by=?, deleted_at=? WHERE id=?`
    ).bind(b.equipoNombre, b.equipoCodigo, b.fecha, b.proximoMant, b.descripcion, b.responsable, b.imagen ?? null, b.nroFactura ?? null, b.facturaImg ?? null, b.deleted ? 1 : 0, b.deletedBy ?? null, b.deletedAt ?? null, b.id).run()
    await env.DB.prepare('DELETE FROM mant_accesorios WHERE mant_id = ?').bind(b.id).run()
    for (const a of (b.accesorios as Record<string, unknown>[] ?? [])) {
      await env.DB.prepare('INSERT INTO mant_accesorios (mant_id, nombre, codigo, cantidad) VALUES (?, ?, ?, ?)').bind(b.id, a.nombre, a.codigo, a.cantidad).run()
    }
    await env.DB.prepare('DELETE FROM mant_auditoria WHERE mant_id = ?').bind(b.id).run()
    for (const a of (b.auditoria as Record<string, unknown>[] ?? [])) {
      await env.DB.prepare('INSERT INTO mant_auditoria (mant_id, usuario, accion, fecha, hora, detalle) VALUES (?, ?, ?, ?, ?, ?)').bind(b.id, a.usuario, a.accion, a.fecha, a.hora, a.detalle ?? null).run()
    }
    const mant = await env.DB.prepare('SELECT * FROM mantenimientos WHERE id = ?').bind(b.id).first()
    return json(await buildMant(env.DB, mant as Record<string, unknown>))
  }

  return err('Método no permitido', 405)
}

// ─── Noticias ─────────────────────────────────────────────────────────────────

async function handleNoticias(req: Request, env: Env, url: URL): Promise<Response> {
  if (req.method === 'GET') {
    const { results } = await env.DB.prepare('SELECT * FROM noticias ORDER BY created_at DESC').all()
    return json(results.map((n: Record<string, unknown>) => ({
      id: n.id, titulo: n.titulo, cuerpo: n.cuerpo, autor: n.autor,
      rol: n.rol, fecha: n.fecha, createdAt: n.created_at, tipo: n.tipo, imagen: n.imagen,
    })))
  }
  if (req.method === 'POST') {
    const b = await req.json() as Record<string, unknown>
    const result = await env.DB.prepare('INSERT INTO noticias (titulo, cuerpo, autor, rol, fecha, tipo, imagen) VALUES (?, ?, ?, ?, ?, ?, ?)').bind(b.titulo, b.cuerpo, b.autor, b.rol, b.fecha, b.tipo, b.imagen ?? null).run()
    const noticia = await env.DB.prepare('SELECT * FROM noticias WHERE id = ?').bind(result.meta.last_row_id).first() as Record<string, unknown>
    return json({
      id: noticia.id, titulo: noticia.titulo, cuerpo: noticia.cuerpo, autor: noticia.autor,
      rol: noticia.rol, fecha: noticia.fecha, createdAt: noticia.created_at, tipo: noticia.tipo, imagen: noticia.imagen,
    }, 201)
  }
  if (req.method === 'DELETE') {
    const id = url.searchParams.get('id')
    if (!id) return err('id requerido')
    await env.DB.prepare('DELETE FROM noticias WHERE id = ?').bind(id).run()
    return json({ ok: true })
  }
  return err('Método no permitido', 405)
}

// ─── Sugerencias ──────────────────────────────────────────────────────────────

async function handleSugerencias(req: Request, env: Env, url: URL): Promise<Response> {
  if (req.method === 'GET') {
    const { results } = await env.DB.prepare('SELECT * FROM sugerencias ORDER BY created_at DESC').all()
    return json(results.map((s: Record<string, unknown>) => ({
      id: s.id, texto: s.texto, autor: s.autor, fecha: s.fecha, estado: s.estado, createdAt: s.created_at,
    })))
  }
  if (req.method === 'POST') {
    const b = await req.json() as Record<string, unknown>
    const result = await env.DB.prepare('INSERT INTO sugerencias (texto, autor, fecha, estado) VALUES (?, ?, ?, ?)').bind(b.texto, b.autor, b.fecha, b.estado ?? 'pendiente').run()
    const sug = await env.DB.prepare('SELECT * FROM sugerencias WHERE id = ?').bind(result.meta.last_row_id).first() as Record<string, unknown>
    return json({ id: sug.id, texto: sug.texto, autor: sug.autor, fecha: sug.fecha, estado: sug.estado, createdAt: sug.created_at }, 201)
  }
  if (req.method === 'PUT') {
    const b = await req.json() as Record<string, unknown>
    await env.DB.prepare('UPDATE sugerencias SET estado=? WHERE id=?').bind(b.estado, b.id).run()
    return json({ ok: true })
  }
  if (req.method === 'DELETE') {
    const id = url.searchParams.get('id')
    if (!id) return err('id requerido')
    await env.DB.prepare('DELETE FROM sugerencias WHERE id = ?').bind(id).run()
    return json({ ok: true })
  }
  return err('Método no permitido', 405)
}

// ─── Notas ────────────────────────────────────────────────────────────────────

async function handleNotas(req: Request, env: Env, url: URL, session: SessionUser): Promise<Response> {
  if (req.method === 'GET') {
    const { results } = await env.DB.prepare('SELECT * FROM notas WHERE user_id = ? ORDER BY created_at DESC').bind(session.user_id).all()
    return json(results.map((n: Record<string, unknown>) => ({ id: n.id, text: n.text, done: n.done === 1, at: n.at, dueDate: n.due_date })))
  }
  if (req.method === 'POST') {
    const b = await req.json() as Record<string, unknown>
    const result = await env.DB.prepare('INSERT INTO notas (user_id, text, done, at, due_date) VALUES (?, ?, ?, ?, ?)').bind(session.user_id, b.text, b.done ? 1 : 0, b.at, b.dueDate ?? null).run()
    return json({ id: result.meta.last_row_id, ...b }, 201)
  }
  if (req.method === 'PUT') {
    const b = await req.json() as Record<string, unknown>
    await env.DB.prepare('UPDATE notas SET text=?, done=?, due_date=? WHERE id=? AND user_id=?').bind(b.text, b.done ? 1 : 0, b.dueDate ?? null, b.id, session.user_id).run()
    return json({ ok: true })
  }
  if (req.method === 'DELETE') {
    const id = url.searchParams.get('id')
    if (!id) return err('id requerido')
    await env.DB.prepare('DELETE FROM notas WHERE id = ? AND user_id = ?').bind(id, session.user_id).run()
    return json({ ok: true })
  }
  return err('Método no permitido', 405)
}

// ─── Main Router ──────────────────────────────────────────────────────────────

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)
    const path = url.pathname

    if (!path.startsWith('/api/')) {
      return env.ASSETS.fetch(request)
    }

    // Public route: noticias (para mostrarlas en la pantalla de login, sin sesión)
    if (path === '/api/public/noticias' && request.method === 'GET') {
      const { results } = await env.DB.prepare('SELECT * FROM noticias ORDER BY created_at DESC LIMIT 5').all()
      return json(results.map((n: Record<string, unknown>) => ({
        id: n.id, titulo: n.titulo, cuerpo: n.cuerpo, autor: n.autor,
        rol: n.rol, fecha: n.fecha, createdAt: n.created_at, tipo: n.tipo, imagen: n.imagen,
      })))
    }

    // Public route: login
    if (path === '/api/auth/login' && request.method === 'POST') {
      const { usuario, password } = await request.json() as { usuario: string; password: string }
      const user = await env.DB.prepare('SELECT * FROM users WHERE usuario = ? AND password = ? AND activo = 1').bind(usuario.toLowerCase(), password).first()
      if (!user) return err('Usuario o contraseña incorrectos', 401)

      const token = crypto.randomUUID()
      const expires = new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString()
      await env.DB.prepare('INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)').bind(token, (user as Record<string, unknown>).id, expires).run()

      const u = user as Record<string, unknown>
      return json({
        token,
        user: {
          id: u.id, nombre: u.nombre, apellido: u.apellido, usuario: u.usuario,
          rol: u.rol, departamento: u.departamento, email: u.email, telefono: u.telefono,
          fechaIngreso: u.fecha_ingreso, cumpleanos: u.cumpleanos, avatar: u.avatar,
          permisos: JSON.parse(u.permisos as string ?? '[]'),
          activo: u.activo === 1, foto: u.foto,
          canPublish: u.can_publish === 1, canDeleteBitacora: u.can_delete_bitacora === 1,
          contactoEmergencia: u.contacto_emergencia_nombre
            ? { nombre: u.contacto_emergencia_nombre, telefono: u.contacto_emergencia_telefono }
            : undefined,
        },
      })
    }

    // Auth check for all other /api/ routes
    const session = await getSession(request, env)
    if (!session) return err('No autorizado', 401)

    if (path === '/api/auth/logout' && request.method === 'POST') {
      const token = request.headers.get('Authorization')?.replace('Bearer ', '')
      if (token) await env.DB.prepare('DELETE FROM sessions WHERE token = ?').bind(token).run()
      return json({ ok: true })
    }

    if (path === '/api/users') return handleUsers(request, env, url, session)
    if (path === '/api/pedidos') return handlePedidos(request, env)
    if (path === '/api/mantenimientos') return handleMantenimientos(request, env)
    if (path === '/api/noticias') return handleNoticias(request, env, url)
    if (path === '/api/sugerencias') return handleSugerencias(request, env, url)
    if (path === '/api/notas') return handleNotas(request, env, url, session)

    return err('Ruta no encontrada', 404)
  },
}
