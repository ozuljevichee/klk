import type { SysUser, Pedido, MantRegistro, Noticia, Note, Sugerencia } from '@/types'

// ─── API Client — Patagonia Circular ─────────────────────────────────────────

const BASE = '/api'

function getToken(): string | null {
  return localStorage.getItem('pc_token')
}

function authHeaders(): Record<string, string> {
  const token = getToken()
  return token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' }
}

async function req<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: authHeaders(),
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Error desconocido' }))
    throw new Error((err as { error?: string }).error ?? `HTTP ${res.status}`)
  }
  return res.json() as Promise<T>
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export async function login(usuario: string, password: string) {
  return req<{ token: string; user: SysUser }>('POST', '/auth/login', { usuario, password })
}

export async function logout() {
  await req('POST', '/auth/logout').catch(() => {})
  localStorage.removeItem('pc_token')
}

export function saveToken(token: string) {
  localStorage.setItem('pc_token', token)
}

export function loadToken(): string | null {
  return getToken()
}

// ─── Users ────────────────────────────────────────────────────────────────────

export async function getUsers() {
  return req<SysUser[]>('GET', '/users')
}

export async function createUser(u: Omit<SysUser, 'id'>) {
  return req<SysUser>('POST', '/users', u)
}

export async function updateUser(u: SysUser) {
  return req<SysUser>('PUT', '/users', u)
}

export async function deleteUser(id: number) {
  return req('DELETE', `/users?id=${id}`)
}

// ─── Pedidos ─────────────────────────────────────────────────────────────────

export async function getPedidos() {
  return req<Pedido[]>('GET', '/pedidos')
}

export async function createPedido(p: Pedido) {
  return req<Pedido>('POST', '/pedidos', p)
}

export async function updatePedido(p: Pedido) {
  return req<Pedido>('PUT', '/pedidos', p)
}

// ─── Mantenimientos ───────────────────────────────────────────────────────────

export async function getMantenimientos() {
  return req<MantRegistro[]>('GET', '/mantenimientos')
}

export async function createMantenimiento(m: MantRegistro) {
  return req<MantRegistro>('POST', '/mantenimientos', m)
}

export async function updateMantenimiento(m: MantRegistro) {
  return req<MantRegistro>('PUT', '/mantenimientos', m)
}

// ─── Noticias ─────────────────────────────────────────────────────────────────

export async function getNoticias() {
  return req<Noticia[]>('GET', '/noticias')
}

export async function createNoticia(n: Omit<Noticia, 'id'>) {
  return req<Noticia>('POST', '/noticias', n)
}

export async function deleteNoticia(id: number) {
  return req('DELETE', `/noticias?id=${id}`)
}

// ─── Sugerencias ──────────────────────────────────────────────────────────────

export async function getSugerencias() {
  return req<Sugerencia[]>('GET', '/sugerencias')
}

export async function createSugerencia(s: Omit<Sugerencia, 'id'>) {
  return req<Sugerencia>('POST', '/sugerencias', s)
}

export async function updateSugerencia(s: Sugerencia) {
  return req('PUT', '/sugerencias', s)
}

export async function deleteSugerencia(id: number) {
  return req('DELETE', `/sugerencias?id=${id}`)
}

// ─── Notas ────────────────────────────────────────────────────────────────────

export async function getNotas() {
  return req<Note[]>('GET', '/notas')
}

export async function createNota(n: { text: string; done: boolean; at: string; dueDate?: string }) {
  return req<Note>('POST', '/notas', n)
}

export async function updateNota(n: Note) {
  return req('PUT', '/notas', n)
}

export async function deleteNota(id: number) {
  return req('DELETE', `/notas?id=${id}`)
}
