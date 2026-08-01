import { useState, useRef, useEffect, useCallback } from 'react'
import * as api from '@/api'
import { createPortal } from 'react-dom'
import bgPattern from '@/imports/image.png'
import bgTexture from '@/imports/Gemini_Generated_Image_jzp2y1jzp2y1jzp2.png'
import bgMain from '@/imports/ChatGPT_Image_31_jul_2026__03_11_58_p.m..png'
import bgMainNew from '@/imports/ChatGPT_Image_31_jul_2026__03_11_58_p.m.-1.png'
import bgPatagonia from '@/imports/ChatGPT_Image_31_jul_2026__19_53_50.png'
import logoImg from '@/imports/image-1.png'
import sparkleImg from '@/imports/image-2.png'
import bgSidebar from '@/imports/image-4.png'

// ─── Types ────────────────────────────────────────────────────────────────────
export type { Page, PedidoEstado, AuditEntry, SysUser, Note, PedidoLog, Pedido, MantAccesorio, MantRegistro, Noticia, Sugerencia } from '@/types'
import type { Page, PedidoEstado, AuditEntry, SysUser, Note, PedidoLog, Pedido, MantAccesorio, MantRegistro, Noticia, Sugerencia } from '@/types'

// ─── Mensajes corporativos rotativos ─────────────────────────────────────────
const MENSAJES = [
  "En Patagonia Circular no solo trabajamos: transformamos el plástico en soluciones reales para el futuro.",
  "Cada listón de ecomadera que creamos es una promesa cumplida con el planeta.",
  "Lo que otros ven como residuo, nosotros lo vemos como la materia prima del mañana.",
  "La sostenibilidad no es solo lo que hacemos, es la energía con la que trabajamos cada día.",
  "Darle una segunda vida a los materiales nos recuerda que todos siempre podemos reinventarnos.",
  "Hoy moldeamos ecomadera, pero también moldeamos un mundo más limpio y fuerte.",
  "Cada jornada es una oportunidad para transformar desafíos en resultados sostenibles.",
  "La ecomadera es resistente, pero el compromiso de este equipo lo es aún más.",
  "Construir un futuro verde requiere constancia, ¡y hoy estamos dando otro gran paso!",
  "Recuerda que con tu trabajo estás cuidando la Patagonia y el planeta que dejaremos mañana.",
  "En cada proyecto ponemos fuerza, innovación y profundo respeto por la naturaleza.",
  "Convertimos el residuo en fortaleza; convertimos el esfuerzo en orgullo.",
  "La verdadera economía circular empieza en nuestras ganas de hacer bien las cosas todos los días.",
  "Lo que hoy fabricamos con las manos perdurará por años protegiendo el entorno.",
  "Hacemos ecomadera con sello patagónico: firme, noble y respetuosa con la vida.",
  "Innovar es ver potencial donde nadie más lo ve. ¡Sigamos marcando la diferencia!",
  "Cada gramo de plástico reciclado es una victoria de nuestro equipo contra la contaminación.",
  "El planeta celebra cada pieza que producimos con dedicación y excelencia.",
  "Somos agentes de cambio activo, no simples espectadores.",
  "La transformación del mundo empieza en nuestro propio taller de trabajo.",
  "Somos un equipo fuerte como la ecomadera y unido por un mismo propósito.",
  "Las grandes metas solo se logran cuando todos remamos hacia el mismo lado.",
  "Tu talento suma, pero nuestra unión multiplica el impacto.",
  "Apoyarnos unos a otros es lo que nos convierte en una verdadera familia circular.",
  "Cada rol en este equipo es vital para que la ecomadera cobre vida.",
  "Juntos enfrentamos cualquier viento fuerte y salimos siempre adelante.",
  "Una idea compartida en equipo se convierte en una gran solución.",
  "El respeto, la comunicación y el apoyo mutuo son nuestras mejores herramientas.",
  "¡Gracias por aportar tu energía y talento al equipo el día de hoy!",
  "Ningún desafío es demasiado grande cuando trabajamos con pasión y en grupo.",
  "En Patagonia Circular, la victoria de uno es la celebración de todos.",
  "Tu compromiso diario inspira a tus compañeros a ser mejores.",
  "Como la Patagonia, somos resistentes, fuertes y capaces de adaptarnos a todo.",
  "Los obstáculos de hoy son las experiencias que fortalecerán nuestro mañana.",
  "Confía en tu capacidad: eres mucho más fuerte y capaz de lo que crees.",
  "Aprender de los errores y levantarse con más ganas es nuestro verdadero espíritu.",
  "Siéntete orgulloso del trabajo que haces: estás construyendo un futuro más verde.",
  "Tu trabajo tiene sentido, propósito e impacto real.",
  "Da lo mejor de ti hoy y tu yo del futuro te lo agradecerá.",
  "La satisfacción del deber bien cumplido es la mejor recompensa del día.",
  "Tu energía positiva contagia y transforma el espacio que te rodea.",
  "Haz que tu jornada valga la pena cuidando la calidad y dando el máximo.",
  "La pasión por lo que hacemos se refleja en la firmeza de lo que entregamos.",
  "¡Iniciemos la jornada con buena energía, sonrisa y la mirada en el éxito!",
  "Una actitud positiva convierte un día común en una experiencia increíble.",
  "Hoy es un gran día para hacer que las cosas pasen.",
  "El trabajo bien hecho hoy deja una huella imborrable en el planeta.",
  "El optimismo es la mejor herramienta para empezar el turno con ganas.",
  "¡Vamos con todo! El futuro de Patagonia Circular lo construimos hoy.",
  "Mantén tu mente clara, tus metas altas y tus ganas bien puestas.",
  "¡Gracias por ser parte fundamental del cambio positivo que la Patagonia y el mundo necesitan!",
]

function useRotatingMessage() {
  const [idx, setIdx] = useState(() => Math.floor(Math.random() * MENSAJES.length))
  const [visible, setVisible] = useState(true)
  useEffect(() => {
    const id = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setIdx(i => { let n = Math.floor(Math.random() * MENSAJES.length); while (n === i) n = Math.floor(Math.random() * MENSAJES.length); return n })
        setVisible(true)
      }, 400)
    }, 10000)
    return () => clearInterval(id)
  }, [])
  return { message: MENSAJES[idx], visible }
}

// ─── Constants ────────────────────────────────────────────────────────────────

const ALL_PAGES: Page[] = ['inicio', 'informacion', 'pedidos', 'mantenimientos', 'companeros']

const PAGE_LABELS: Record<Page, string> = {
  inicio: 'Inicio', informacion: 'Información', pedidos: 'Pedidos',
  mantenimientos: 'Mantenimientos', companeros: 'Compañeros', admin: 'Admin Usuarios',
}

const MATERIALES = [
  { nombre: 'Tablón', pesoKg: 12 }, { nombre: 'Tabla 6,5kg', pesoKg: 6.5 },
  { nombre: 'Tabla Deck 6,5kg', pesoKg: 6.5 }, { nombre: 'Listón 4,5kg', pesoKg: 4.5 },
  { nombre: 'Viga 9kg', pesoKg: 9 }, { nombre: 'Poste Redondo 22kg', pesoKg: 22 },
  { nombre: 'Poste Cuadrado 9x9 14kg', pesoKg: 14 }, { nombre: 'Poste Redondo 14kg', pesoKg: 14 },
  { nombre: 'Poste Rectangular 22kg', pesoKg: 22 },
]

const WMO: Record<number, { desc: string; icon: string }> = {
  0: { desc: 'Cielo despejado', icon: '☀️' }, 1: { desc: 'Mayormente despejado', icon: '🌤️' },
  2: { desc: 'Parcialmente nublado', icon: '⛅' }, 3: { desc: 'Nublado', icon: '☁️' },
  45: { desc: 'Neblina', icon: '🌫️' }, 48: { desc: 'Neblina helada', icon: '🌫️' },
  51: { desc: 'Llovizna leve', icon: '🌦️' }, 53: { desc: 'Llovizna moderada', icon: '🌦️' },
  55: { desc: 'Llovizna intensa', icon: '🌧️' }, 61: { desc: 'Lluvia leve', icon: '🌧️' },
  63: { desc: 'Lluvia moderada', icon: '🌧️' }, 65: { desc: 'Lluvia intensa', icon: '🌧️' },
  71: { desc: 'Nevada leve', icon: '🌨️' }, 73: { desc: 'Nevada moderada', icon: '❄️' },
  75: { desc: 'Nevada intensa', icon: '❄️' }, 77: { desc: 'Granizo', icon: '🌨️' },
  80: { desc: 'Chubascos leves', icon: '🌦️' }, 81: { desc: 'Chubascos moderados', icon: '🌧️' },
  82: { desc: 'Chubascos intensos', icon: '⛈️' }, 95: { desc: 'Tormenta', icon: '⛈️' },
  96: { desc: 'Tormenta con granizo', icon: '⛈️' }, 99: { desc: 'Tormenta intensa', icon: '⛈️' },
}

const ESTADO_PED_LABEL: Record<PedidoEstado, string> = {
  ingresado: 'Ingresado', en_proceso: 'En Proceso', en_inspeccion: 'En Inspección', terminado: 'Terminado',
}
const ESTADO_PED_NEXT: Record<PedidoEstado, PedidoEstado | null> = {
  ingresado: 'en_proceso', en_proceso: 'en_inspeccion', en_inspeccion: 'terminado', terminado: null,
}
const ESTADO_PED_PREV: Record<PedidoEstado, PedidoEstado | null> = {
  ingresado: null, en_proceso: 'ingresado', en_inspeccion: 'en_proceso', terminado: 'en_inspeccion',
}
const ESTADO_PED_COLOR: Record<PedidoEstado, string> = {
  ingresado: 'bg-slate-100 text-slate-700 border-slate-200',
  en_proceso: 'bg-blue-100 text-blue-700 border-blue-200',
  en_inspeccion: 'bg-amber-100 text-amber-700 border-amber-200',
  terminado: 'bg-emerald-100 text-emerald-700 border-emerald-200',
}
const LOG_COLOR: Record<string, string> = {
  creacion: 'bg-brand-500', estado: 'bg-blue-500', falla: 'bg-red-500', atraso: 'bg-amber-500', nota: 'bg-slate-400',
}
const LOG_LABEL: Record<string, string> = {
  creacion: 'Creación', estado: 'Cambio Estado', falla: 'Falla', atraso: 'Atraso', nota: 'Nota',
}
const TIPO_NOT_COLOR: Record<string, string> = {
  comunicado: 'bg-blue-500', operacional: 'bg-emerald-500', seguridad: 'bg-orange-500', admin: 'bg-slate-500',
}
const TIPO_NOT_LABEL: Record<string, string> = {
  comunicado: 'Comunicado', operacional: 'Operacional', seguridad: 'Seguridad', admin: 'Administración',
}

// ─── Initial Data (vacío — todo viene de D1) ──────────────────────────────────

// ─── Helpers ──────────────────────────────────────────────────────────────────

function nowDate() { return new Date().toLocaleDateString('es-CL') }
function nowTime() { return new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }) }
function mkAudit(user: SysUser, accion: string, detalle?: string): AuditEntry {
  return { usuario: `${user.nombre} ${user.apellido}`, accion, fecha: nowDate(), hora: nowTime(), detalle }
}
function isOverdue(dateStr: string): boolean {
  if (!dateStr) return false
  const d = new Date(dateStr)
  return !isNaN(d.getTime()) && d < new Date()
}
function fmtDate(s: string): string {
  if (!s) return ''
  if (s.includes('-')) { const [y, m, d] = s.split('-'); return `${d}/${m}/${y}` }
  return s
}
function isProximoCumple(fecha: string) {
  const [d, m] = fecha.split('/').map(Number)
  const hoy = new Date()
  const diff = (m - (hoy.getMonth() + 1)) * 30 + (d - hoy.getDate())
  return diff >= 0 && diff <= 15
}
function relativeTime(iso?: string): string {
  if (!iso) return 'Nunca'
  const diff = Date.now() - new Date(iso).getTime()
  const min = Math.floor(diff / 60000)
  if (min < 1) return 'Hace un momento'
  if (min < 60) return `Hace ${min} min`
  const h = Math.floor(min / 60)
  if (h < 24) return `Hace ${h}h`
  const d = Math.floor(h / 24)
  if (d === 1) return 'Ayer'
  return `Hace ${d} días`
}

function diffRegistro(old: MantRegistro, nxt: MantRegistro): string {
  const c: string[] = []
  if (old.equipoNombre !== nxt.equipoNombre) c.push(`Equipo: "${old.equipoNombre}" → "${nxt.equipoNombre}"`)
  if (old.equipoCodigo !== nxt.equipoCodigo) c.push(`Código: ${old.equipoCodigo} → ${nxt.equipoCodigo}`)
  if (old.fecha !== nxt.fecha) c.push(`F.Mant: ${fmtDate(old.fecha)} → ${fmtDate(nxt.fecha)}`)
  if (old.proximoMant !== nxt.proximoMant) c.push(`F.Próx: ${fmtDate(old.proximoMant)} → ${fmtDate(nxt.proximoMant)}`)
  if (old.descripcion !== nxt.descripcion) c.push('Descripción modificada')
  if (old.responsable !== nxt.responsable) c.push(`Responsable: ${old.responsable} → ${nxt.responsable}`)
  if (old.nroFactura !== nxt.nroFactura) c.push(`Factura: ${old.nroFactura || '-'} → ${nxt.nroFactura || '-'}`)
  const oa = old.accesorios.map(a => `${a.nombre}×${a.cantidad}`).join(',')
  const na = nxt.accesorios.map(a => `${a.nombre}×${a.cantidad}`).join(',')
  if (oa !== na) c.push('Accesorios modificados')
  return c.length ? c.join(' | ') : 'Sin cambios detectados'
}
function mkAvatar(nombre: string, apellido: string) {
  return `${nombre.charAt(0)}${apellido.charAt(0)}`.toUpperCase()
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

interface WeatherState { temp: number; desc: string; wind: number; icon: string; humidity: number; sensation: number; loading: boolean; err: boolean }

function useWeather(): WeatherState {
  const [w, setW] = useState<WeatherState>({ temp: 0, desc: 'Cargando...', wind: 0, icon: '⏳', humidity: 0, sensation: 0, loading: true, err: false })
  useEffect(() => {
    const load = async () => {
      try {
        const url = 'https://api.open-meteo.com/v1/forecast?latitude=-53.1548&longitude=-70.9106&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&wind_speed_unit=kmh&timezone=America%2FSantiago'
        const res = await fetch(url)
        const json = await res.json()
        const c = json.current
        const wmo = WMO[c.weather_code as number] ?? { desc: 'Variable', icon: '🌡️' }
        setW({ temp: Math.round(c.temperature_2m), desc: wmo.desc, wind: Math.round(c.wind_speed_10m), icon: wmo.icon, humidity: Math.round(c.relative_humidity_2m), sensation: Math.round(c.apparent_temperature), loading: false, err: false })
      } catch { setW(p => ({ ...p, loading: false, err: true, desc: 'Sin conexión', icon: '📡' })) }
    }
    load()
    const id = setInterval(load, 600000)
    return () => clearInterval(id)
  }, [])
  return w
}

function useNotes() {
  const [notes, setNotes] = useState<Note[]>([])

  useEffect(() => {
    api.getNotas().then(setNotes).catch(() => {})
  }, [])

  const add = useCallback(async (text: string, dueDate?: string) => {
    if (!text.trim()) return
    const n = await api.createNota({ text: text.trim(), done: false, at: new Date().toLocaleString('es-CL'), dueDate: dueDate || undefined })
    setNotes(p => [n, ...p])
  }, [])

  const toggle = useCallback(async (id: number) => {
    setNotes(p => p.map(n => n.id === id ? { ...n, done: !n.done } : n))
    const note = await api.getNotas().then(ns => ns.find(n => n.id === id))
    if (note) await api.updateNota({ ...note, done: !note.done })
  }, [])

  const remove = useCallback(async (id: number) => {
    setNotes(p => p.filter(n => n.id !== id))
    await api.deleteNota(id)
  }, [])

  const edit = useCallback(async (id: number, text: string, dueDate?: string) => {
    setNotes(p => p.map(n => n.id === id ? { ...n, text, dueDate: dueDate || undefined } : n))
    const note = await api.getNotas().then(ns => ns.find(n => n.id === id))
    if (note) await api.updateNota({ ...note, text, dueDate: dueDate || undefined })
  }, [])

  return { notes, add, toggle, remove, edit }
}

function noteLight(dueDate?: string): 'green' | 'amber' | 'red' | null {
  if (!dueDate) return null
  const d = new Date(dueDate)
  if (isNaN(d.getTime())) return null
  const diff = (d.getTime() - new Date().getTime()) / 86400000
  if (diff < 0) return 'red'
  if (diff <= 2) return 'amber'
  return 'green'
}

// ─── Reusable UI ──────────────────────────────────────────────────────────────

function PulseDot({ color = 'green' }: { color?: 'green' | 'red' | 'amber' }) {
  const cls = color === 'red' ? 'bg-red-500' : color === 'amber' ? 'bg-amber-400' : 'bg-emerald-400'
  return <span className={`inline-block w-2 h-2 rounded-full ${cls} pulse-dot flex-shrink-0`} />
}

function Logo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const w = size === 'lg' ? 'w-36' : size === 'md' ? 'w-28' : 'w-14'
  return <img src={logoImg} alt="Patagonia Circular" className={`${w} object-contain`} style={{ borderRadius: 8 }} />
}

function Modal({ title, onClose, children, wide, extraWide }: { title: string; onClose: () => void; children: React.ReactNode; wide?: boolean; extraWide?: boolean }) {
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', fn)
    return () => document.removeEventListener('keydown', fn)
  }, [onClose])
  const maxW = extraWide ? 'max-w-5xl' : wide ? 'max-w-3xl' : 'max-w-xl'
  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6" style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)' }} onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className={`bg-white rounded-2xl shadow-2xl w-full flex flex-col ${maxW}`} style={{ maxHeight: '90vh' }}>
        <div className="flex items-center justify-between px-7 py-5 border-b border-slate-100 flex-shrink-0">
          <h2 className="font-bold text-slate-800 text-lg" style={{ fontFamily: 'Outfit,sans-serif' }}>{title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 text-2xl leading-none w-9 h-9 flex items-center justify-center rounded-xl hover:bg-slate-100 transition-colors font-light">×</button>
        </div>
        <div className="overflow-y-auto flex-1 px-7 py-6">{children}</div>
      </div>
    </div>,
    document.body
  )
}

function GreenBtn({ label, onClick, small, red }: { label: string; onClick: () => void; small?: boolean; red?: boolean }) {
  const bg = red ? 'linear-gradient(135deg,#ef4444,#b91c1c)' : 'linear-gradient(135deg,#2a8a5e,#154d38)'
  return (
    <button onClick={onClick} className={`btn-hover rounded-xl font-semibold text-white ${small ? 'px-3 py-1.5 text-xs' : 'px-5 py-2.5 text-sm'}`} style={{ background: bg }}>
      {label}
    </button>
  )
}

function InputField({ label, value, onChange, type = 'text', placeholder, readonly }: { label: string; value: string; onChange?: (v: string) => void; type?: string; placeholder?: string; readonly?: boolean }) {
  return (
    <div>
      <label className="text-xs font-medium text-slate-500 mb-1 block">{label}</label>
      <input type={type} value={value} onChange={e => onChange?.(e.target.value)} placeholder={placeholder} readOnly={readonly} className={`w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-brand-500 transition-colors ${readonly ? 'bg-slate-100 text-slate-500' : 'bg-slate-50'}`} />
    </div>
  )
}

function SelectField({ label, value, onChange, children }: { label: string; value: string; onChange: (v: string) => void; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-medium text-slate-500 mb-1 block">{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-brand-500 bg-slate-50 transition-colors">
        {children}
      </select>
    </div>
  )
}

function ImageUpload({ value, onChange, label }: { value?: string; onChange: (v: string) => void; label: string }) {
  const ref = useRef<HTMLInputElement>(null)
  const handle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return
    const r = new FileReader(); r.onload = () => onChange(r.result as string); r.readAsDataURL(file)
  }
  return (
    <div>
      <label className="text-xs font-medium text-slate-500 mb-1 block">{label}</label>
      {value ? (
        <div className="relative rounded-xl overflow-hidden">
          <img src={value} className="w-full h-32 object-cover" alt="preview" />
          <button onClick={() => onChange('')} className="absolute top-1.5 right-1.5 bg-red-500 text-white rounded-full w-6 h-6 text-sm flex items-center justify-center shadow">×</button>
        </div>
      ) : (
        <div onClick={() => ref.current?.click()} className="border-2 border-dashed border-slate-200 rounded-xl h-24 flex flex-col items-center justify-center cursor-pointer hover:border-brand-400 transition-colors gap-1 btn-hover">
          <span className="text-2xl">📷</span>
          <span className="text-slate-400 text-xs">Clic para subir imagen</span>
        </div>
      )}
      <input ref={ref} type="file" accept="image/*" className="hidden" onChange={handle} />
    </div>
  )
}

// ─── Weather Widget ────────────────────────────────────────────────────────────

function WeatherWidget({ glass }: { glass?: boolean }) {
  const w = useWeather()
  const base = glass
    ? { background: 'rgba(255,255,255,0.10)', backdropFilter: 'blur(14px)', border: '1px solid rgba(255,255,255,0.18)' }
    : { background: '#fff', border: '1px solid #e2e8f0' }
  return (
    <div className="rounded-2xl p-5" style={base}>
      <div className={`text-sm mb-3 ${glass ? 'text-white/60' : 'text-slate-400'}`}>📍 Punta Arenas, Magallanes</div>
      {w.loading ? (
        <div className={`text-sm ${glass ? 'text-white/70' : 'text-slate-500'}`}>Cargando clima...</div>
      ) : w.err ? (
        <div className={`text-sm ${glass ? 'text-white/70' : 'text-slate-500'}`}>📡 Sin conexión a la API</div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-5xl">{w.icon}</span>
              <div>
                <div className={`text-5xl font-light ${glass ? 'text-white' : 'text-slate-800'}`} style={{ fontFamily: 'Outfit,sans-serif' }}>{w.temp}°C</div>
                <div className={`text-sm mt-0.5 ${glass ? 'text-white/70' : 'text-slate-500'}`}>{w.desc}</div>
              </div>
            </div>
            <div className={`text-right flex flex-col gap-1.5 text-sm ${glass ? 'text-white/60' : 'text-slate-500'}`}>
              <div>💨 {w.wind} km/h</div>
              <div>💧 {w.humidity}%</div>
              <div>🌡️ ST {w.sensation}°C</div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// ─── Login Page ────────────────────────────────────────────────────────────────

function LoginPage({ onLogin, users, noticias }: { onLogin: (u: SysUser) => void; users: SysUser[]; noticias: Noticia[] }) {
  const [usuario, setUsuario] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    setError(''); setLoading(true)
    try {
      const { token, user } = await api.login(usuario, password)
      api.saveToken(token)
      onLogin(user)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Usuario o contraseña incorrectos')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center relative overflow-hidden px-4 pb-6" style={{ backgroundImage: `url(${bgPatagonia})`, backgroundSize: 'cover', backgroundPosition: '5% center' }}>
      <div className="absolute inset-0 z-0" style={{ background: 'rgba(4,14,8,0.38)' }} />

      <div className="relative flex flex-col items-center w-full" style={{ zIndex: 1, maxWidth: 1100 }}>

        {/* Logo — glued to top edge, centered, slightly protruding */}
        <div className="flex items-center justify-center px-16 py-5 shadow-2xl" style={{ background: '#ffffff', borderRadius: '0 0 20px 20px', minWidth: 520, alignSelf: 'center' }}>
          <Logo size="lg" />
        </div>

        {/* Main card — attached just below logo */}
        <div className="relative w-full overflow-hidden shadow-2xl mt-4" style={{ background: 'rgba(10,26,16,0.02)', backdropFilter: 'blur(3px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '0 0 20px 20px', borderTopLeftRadius: 20, borderTopRightRadius: 20 }}>
          <div className="flex flex-col lg:flex-row">

            {/* ── LEFT: weather + news ── */}
            <div className="flex-1 p-8 flex flex-col gap-5" style={{ borderRight: '1px solid rgba(255,255,255,0.08)' }}>

              {/* Weather */}
              <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.13)' }}>
                <div className="text-white/50 text-xs mb-3">📍 Punta Arenas, Magallanes</div>
                <WeatherInline />
              </div>

              {/* News */}
              <div className="flex-1 flex flex-col min-h-0">
                <h2 className="text-white font-semibold mb-3 text-base" style={{ fontFamily: 'Outfit,sans-serif' }}>📢 Noticias y Actualizaciones</h2>
                <div className="flex flex-col gap-2.5 overflow-y-auto" style={{ maxHeight: 300 }}>
                  {(noticias ?? []).length === 0 && (
                    <div className="rounded-xl px-4 py-8 text-center text-white/30 text-sm" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>Sin noticias publicadas aún.</div>
                  )}
                  {(noticias ?? []).map(n => (
                    <div key={n.id} className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full ${TIPO_NOT_COLOR[n.tipo]}`}>{TIPO_NOT_LABEL[n.tipo]}</span>
                        <span className="text-white/35 text-[10px]">{n.fecha}</span>
                      </div>
                      <p className="text-white text-sm font-medium leading-snug">{n.titulo}</p>
                      <p className="text-white/40 text-[10px] mt-1.5">— {n.autor}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── RIGHT: login form ── */}
            <div className="w-full lg:w-[360px] flex-shrink-0 p-8 flex flex-col justify-center gap-5">
              <div className="text-center">
                <h2 className="text-white font-bold text-2xl" style={{ fontFamily: 'Outfit,sans-serif' }}>Iniciar Sesión</h2>
                <PuntaArenasTime />
              </div>

              {error && <div className="bg-red-900/40 border border-red-500/40 text-red-300 text-sm rounded-xl px-4 py-3 text-center">{error}</div>}

              <div className="flex flex-col gap-1.5">
                <label className="text-white/55 text-xs font-semibold tracking-wide">Usuario</label>
                <input value={usuario} onChange={e => setUsuario(e.target.value)} placeholder="Ingresa tu usuario"
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-brand-400/50 text-slate-800 placeholder-slate-400"
                  style={{ background: 'rgba(255,255,255,0.94)', border: '1px solid rgba(255,255,255,0.3)' }} />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-white/55 text-xs font-semibold tracking-wide">Contraseña</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} placeholder="••••••••"
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-brand-400/50 text-slate-800 placeholder-slate-400"
                  style={{ background: 'rgba(255,255,255,0.94)', border: '1px solid rgba(255,255,255,0.3)' }} />
              </div>

              <button onClick={handleLogin} disabled={loading} className="btn-hover w-full rounded-xl py-3.5 font-bold text-white text-sm disabled:opacity-60 shadow-lg" style={{ background: 'linear-gradient(135deg,#2a8a5e,#154d38)' }}>
                {loading ? '⏳ Verificando...' : 'Ingresar'}
              </button>
            </div>
          </div>

          {/* Visítanos — attached to bottom of card */}
          <a href="https://patagoniacircular.cl/" target="_blank" rel="noopener noreferrer"
            className="btn-hover flex items-center justify-center gap-2 py-3.5 text-sm font-semibold text-white/70 hover:text-white transition-colors"
            style={{ background: 'rgba(255,255,255,0.06)', borderTop: '1px solid rgba(255,255,255,0.09)' }}>
            🌿 ¡Visítanos! <span className="text-white/40 text-xs ml-1">patagoniacircular.cl →</span>
          </a>
        </div>

        {/* Copyright */}
        <p className="text-white/25 text-xs mt-4">Copyright © 2024 Patagonia Circular — Todos los derechos reservados</p>
      </div>
    </div>
  )
}

function PuntaArenasTime() {
  const [time, setTime] = useState('')
  useEffect(() => {
    const update = () => {
      const t = new Date().toLocaleTimeString('es-CL', { timeZone: 'America/Punta_Arenas', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
      setTime(t)
    }
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [])
  return (
    <div className="mt-1.5 flex flex-col items-center gap-0.5">
      <span className="text-white font-mono text-xl font-semibold tracking-widest" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{time}</span>
      <span className="text-white/35 text-[10px] tracking-wider uppercase">Hora oficial · Punta Arenas, Chile</span>
    </div>
  )
}

function WeatherInline() {
  const w = useWeather()
  if (w.loading) return <div className="text-white/40 text-sm">Cargando clima...</div>
  if (w.err) return <div className="text-white/40 text-sm">📡 Sin conexión a la API</div>
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span className="text-4xl">{w.icon}</span>
        <div>
          <div className="text-white text-4xl font-light" style={{ fontFamily: 'Outfit,sans-serif' }}>{w.temp}°C</div>
          <div className="text-white/50 text-xs mt-0.5">{w.desc}</div>
        </div>
      </div>
      <div className="text-right flex flex-col gap-1 text-white/50 text-xs">
        <div>💨 {w.wind} km/h</div>
        <div>💧 {w.humidity}%</div>
        <div>🌡️ ST {w.sensation}°C</div>
      </div>
    </div>
  )
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

const NAV: { id: Page; label: string; icon: string }[] = [
  { id: 'inicio', label: 'Inicio', icon: '🏠' }, { id: 'informacion', label: 'Información', icon: '📋' },
  { id: 'pedidos', label: 'Pedidos', icon: '📦' }, { id: 'mantenimientos', label: 'Mantenimientos', icon: '🔧' },
  { id: 'companeros', label: 'Compañeros', icon: '👥' },
  { id: 'admin', label: 'Admin Usuarios', icon: '⚙️' },
]



function Sidebar({ page, onNav, user, onLogout, collapsed, onToggle }: { page: Page; onNav: (p: Page) => void; user: SysUser; onLogout: () => void; collapsed: boolean; onToggle: () => void }) {
  return (
    <aside
      className="flex flex-col min-h-screen flex-shrink-0 relative transition-all duration-300"
      style={{ width: collapsed ? 64 : 256, background: '#000' }}
    >
      {/* background image — colores originales */}
      <div className="absolute inset-0 z-0" style={{ backgroundImage: `url(${bgSidebar})`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.75 }} />
      {/* tela difuminada discreta */}
      <div className="absolute inset-0 z-10" style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(3px)', WebkitBackdropFilter: 'blur(3px)' }} />
      <div className="flex flex-col h-full relative z-20">
        {/* Logo strip */}
        <div className="w-full flex items-center justify-center flex-shrink-0 overflow-hidden transition-all duration-300" style={{ background: '#ffffff', borderRadius: '0 0 14px 14px', padding: collapsed ? '10px 8px' : '14px 12px' }}>
          {collapsed
            ? <img src={logoImg} alt="" style={{ width: 36, height: 36, objectFit: 'contain', borderRadius: 6 }} />
            : <Logo size="md" />
          }
        </div>

        {/* Toggle arrow button on right edge */}
        <button
          onClick={onToggle}
          title={collapsed ? 'Expandir menú' : 'Colapsar menú'}
          className="absolute z-20 flex items-center justify-center shadow-lg transition-all hover:brightness-110"
          style={{ right: -10, top: '50%', transform: 'translateY(-50%)', background: '#1e6b4a', border: '2px solid rgba(255,255,255,0.3)', color: '#fff', fontSize: 13, fontWeight: 700, width: 20, height: 56, borderRadius: 6 }}
        >
          {collapsed ? '›' : '‹'}
        </button>

        <nav className="flex-1 px-2 py-4 flex flex-col gap-1 overflow-hidden">
          {NAV.filter(n => user.permisos.includes(n.id)).map(item => (
            <button
              key={item.id}
              onClick={() => onNav(item.id)}
              title={collapsed ? item.label : undefined}
              className={`flex items-center rounded-xl text-sm font-medium transition-all text-left w-full btn-hover ${collapsed ? 'justify-center px-2 py-3' : 'gap-3 px-4 py-2.5'} ${page === item.id ? 'bg-white/20 text-white shadow-sm' : 'text-white/60 hover:bg-white/10 hover:text-white'}`}
            >
              <span className="text-base">{item.icon}</span>
              {!collapsed && <span className="truncate">{item.label}</span>}
            </button>
          ))}
        </nav>



        <div className={`border-t border-white/10 pt-3 pb-4 ${collapsed ? 'px-1' : 'px-3'}`}>
          {collapsed ? (
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 rounded-full overflow-hidden" style={{ background: 'linear-gradient(135deg,#3dab76,#1e6b4a)' }}>
                {user.foto
                  ? <img src={user.foto} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} alt="" />
                  : <div className="w-full h-full flex items-center justify-center text-xs font-bold text-white">{user.avatar}</div>
                }
              </div>
              <button onClick={onLogout} title="Cerrar sesión" className="text-white/40 hover:text-white/80 transition-colors text-xs">⏏</button>
            </div>
          ) : (
            <div className="flex items-center gap-3 px-3 py-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.10)' }}>
              <div className="w-8 h-8 rounded-full flex-shrink-0 overflow-hidden" style={{ background: 'linear-gradient(135deg,#3dab76,#1e6b4a)' }}>
                {user.foto
                  ? <img src={user.foto} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} alt="" />
                  : <div className="w-full h-full flex items-center justify-center text-xs font-bold text-white">{user.avatar}</div>
                }
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white text-xs font-semibold truncate">{user.nombre} {user.apellido}</div>
                <div className="text-white/50 text-[10px] truncate">{user.rol}</div>
              </div>
              <button onClick={onLogout} title="Cerrar sesión" className="text-white/40 hover:text-white/80 transition-colors text-sm">⏏</button>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}

// ─── Page: Admin Usuarios ─────────────────────────────────────────────────────

const BLANK_USER: Omit<SysUser, 'id'> = { nombre: '', apellido: '', usuario: '', password: '', rol: '', departamento: '', email: '', telefono: '', fechaIngreso: '', cumpleanos: '', avatar: '', permisos: [...ALL_PAGES], activo: true }

// Defined at MODULE level — prevents unmount/remount on parent re-render (focus bug fix)
function AdminUserForm({ u, setter }: { u: SysUser | Omit<SysUser, 'id'>; setter: (v: any) => void }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <InputField label="Nombre" value={u.nombre} onChange={v => setter({ ...u, nombre: v })} />
      <InputField label="Apellido" value={u.apellido} onChange={v => setter({ ...u, apellido: v })} />
      <InputField label="Rol / Cargo" value={u.rol} onChange={v => setter({ ...u, rol: v })} />
      <InputField label="Departamento" value={u.departamento} onChange={v => setter({ ...u, departamento: v })} />
      <InputField label="Usuario (login)" value={u.usuario} onChange={v => setter({ ...u, usuario: v.toLowerCase() })} placeholder="sin espacios" />
      <InputField label="Contraseña" value={u.password} onChange={v => setter({ ...u, password: v })} type="password" />
      <InputField label="Email" value={u.email} onChange={v => setter({ ...u, email: v })} />
      <InputField label="Teléfono" value={u.telefono} onChange={v => setter({ ...u, telefono: v })} />
      <InputField label="Contacto Emergencia (nombre)" value={(u as SysUser).contactoEmergencia?.nombre ?? ''} onChange={v => setter({ ...u, contactoEmergencia: { ...((u as SysUser).contactoEmergencia ?? { nombre: '', telefono: '' }), nombre: v } })} placeholder="Nombre del familiar" />
      <InputField label="Teléfono Emergencia" value={(u as SysUser).contactoEmergencia?.telefono ?? ''} onChange={v => setter({ ...u, contactoEmergencia: { ...((u as SysUser).contactoEmergencia ?? { nombre: '', telefono: '' }), telefono: v } })} placeholder="+56 9 XXXX XXXX" />
      <InputField label="Cumpleaños (DD/MM/AAAA)" value={u.cumpleanos} onChange={v => setter({ ...u, cumpleanos: v })} placeholder="01/01/1990" />
      <InputField label="Fecha Ingreso (DD/MM/AAAA)" value={u.fechaIngreso} onChange={v => setter({ ...u, fechaIngreso: v })} placeholder="01/01/2024" />
      <div>
        <label className="text-xs font-medium text-slate-500 mb-1 block">Estado</label>
        <select value={u.activo ? 'activo' : 'inactivo'} onChange={e => setter({ ...u, activo: e.target.value === 'activo' })} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none bg-slate-50">
          <option value="activo">Activo</option><option value="inactivo">Inactivo</option>
        </select>
      </div>
    </div>
  )
}

function AdminPermCheckboxes({ u, setter }: { u: SysUser | Omit<SysUser, 'id'>; setter: (v: any) => void }) {
  const toggle = (p: Page) => {
    const has = u.permisos.includes(p)
    setter({ ...u, permisos: has ? u.permisos.filter(x => x !== p) : [...u.permisos, p] })
  }
  return (
    <div className="flex flex-col gap-3 mt-3">
      <div className="grid grid-cols-3 gap-2">
        {([...ALL_PAGES, 'admin'] as Page[]).map(p => (
          <label key={p} className={`flex items-center gap-2 rounded-xl px-3 py-2.5 cursor-pointer border transition-colors ${u.permisos.includes(p) ? 'bg-brand-50 border-brand-300' : 'bg-slate-50 border-slate-200 hover:border-brand-200'}`}>
            <input type="checkbox" checked={u.permisos.includes(p)} onChange={() => toggle(p)} className="accent-brand-600" />
            <span className="text-sm text-slate-700">{PAGE_LABELS[p]}</span>
          </label>
        ))}
      </div>
      <div className="border-t border-slate-100 pt-3">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Permisos especiales</div>
        <div className="grid grid-cols-2 gap-2">
          <label className={`flex items-center gap-2 rounded-xl px-3 py-2.5 cursor-pointer border transition-colors ${u.canPublish ? 'bg-blue-50 border-blue-300' : 'bg-slate-50 border-slate-200 hover:border-blue-200'}`}>
            <input type="checkbox" checked={!!u.canPublish} onChange={() => setter({ ...u, canPublish: !u.canPublish })} className="accent-blue-600" />
            <span className="text-sm text-slate-700">Publicar noticias</span>
          </label>
          <label className={`flex items-center gap-2 rounded-xl px-3 py-2.5 cursor-pointer border transition-colors ${u.canDeleteBitacora ? 'bg-amber-50 border-amber-300' : 'bg-slate-50 border-slate-200 hover:border-amber-200'}`}>
            <input type="checkbox" checked={!!u.canDeleteBitacora} onChange={() => setter({ ...u, canDeleteBitacora: !u.canDeleteBitacora })} className="accent-amber-600" />
            <span className="text-sm text-slate-700">Borrar bitácora</span>
          </label>
        </div>
      </div>
    </div>
  )
}

function PageAdmin({ users, setUsers, currentUser }: { users: SysUser[]; setUsers: React.Dispatch<React.SetStateAction<SysUser[]>>; currentUser: SysUser }) {
  const [editUser, setEditUser] = useState<SysUser | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [newUser, setNewUser] = useState<Omit<SysUser, 'id'>>({ ...BLANK_USER })
  const [confirmDel, setConfirmDel] = useState<number | null>(null)

  const saveEdit = () => {
    if (!editUser) return
    setUsers(prev => prev.map(u => u.id === editUser.id ? editUser : u))
    setEditUser(null)
  }
  const addUser = () => {
    if (!newUser.nombre || !newUser.apellido || !newUser.usuario || !newUser.password) return
    const id = Math.max(...users.map(u => u.id)) + 1
    const avatar = mkAvatar(newUser.nombre, newUser.apellido)
    setUsers(prev => [...prev, { ...newUser, id, avatar }])
    setNewUser({ ...BLANK_USER }); setShowAdd(false)
  }
  const deleteUser = (id: number) => {
    setUsers(prev => prev.filter(u => u.id !== id))
    setConfirmDel(null)
  }

  return (
    <div className="p-8 max-w-6xl mx-auto w-full page-enter">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800" style={{ fontFamily: 'Outfit,sans-serif' }}>⚙️ Administración de Usuarios</h1>
          <p className="text-slate-500 text-sm mt-0.5">Gestiona roles, permisos y datos de cada miembro del equipo</p>
        </div>
        <GreenBtn label="+ Nuevo Usuario" onClick={() => setShowAdd(true)} />
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100" style={{ background: '#f8faf9' }}>
              {['Usuario', 'Rol', 'Depto.', 'Cumpleaños', 'Estado', 'Permisos', ''].map(h => (
                <th key={h} className="text-left px-5 py-3 text-slate-500 font-semibold text-xs uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{ background: 'linear-gradient(135deg,#3dab76,#1e6b4a)' }}>{u.avatar}</div>
                    <div><div className="font-semibold text-slate-800">{u.nombre} {u.apellido}</div><div className="text-slate-400 text-xs">@{u.usuario}</div></div>
                  </div>
                </td>
                <td className="px-5 py-3 text-slate-700 text-sm">{u.rol}</td>
                <td className="px-5 py-3 text-slate-600 text-sm">{u.departamento}</td>
                <td className="px-5 py-3 text-slate-600 text-sm">{u.cumpleanos}</td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-1.5">
                    <PulseDot color={u.activo ? 'green' : 'red'} />
                    <span className={`text-xs font-medium ${u.activo ? 'text-emerald-700' : 'text-red-600'}`}>{u.activo ? 'Activo' : 'Inactivo'}</span>
                  </div>
                </td>
                <td className="px-5 py-3">
                  <div className="flex flex-wrap gap-1">
                    {u.permisos.map(p => <span key={p} className="bg-brand-50 text-brand-700 text-[10px] px-1.5 py-0.5 rounded-full border border-brand-200">{PAGE_LABELS[p]}</span>)}
                  </div>
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => setEditUser({ ...u })} className="text-xs bg-brand-50 text-brand-700 px-2.5 py-1.5 rounded-lg hover:bg-brand-100 transition-colors font-semibold btn-hover">Editar</button>
                    {u.id !== currentUser.id && (
                      <button onClick={() => setConfirmDel(u.id)} className="text-xs bg-red-50 text-red-600 px-2.5 py-1.5 rounded-lg hover:bg-red-100 transition-colors font-semibold btn-hover">Eliminar</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Confirm delete */}
      {confirmDel !== null && (
        <Modal title="Confirmar eliminación" onClose={() => setConfirmDel(null)}>
          <p className="text-slate-600 mb-5">¿Eliminar al usuario <strong>{users.find(u => u.id === confirmDel)?.nombre} {users.find(u => u.id === confirmDel)?.apellido}</strong>? Esta acción no se puede deshacer.</p>
          <div className="flex gap-3">
            <button onClick={() => setConfirmDel(null)} className="flex-1 rounded-xl py-2.5 text-sm font-medium text-slate-600 border border-slate-200 hover:bg-slate-50">Cancelar</button>
            <GreenBtn label="Eliminar definitivamente" onClick={() => deleteUser(confirmDel)} red />
          </div>
        </Modal>
      )}

      {/* Edit user */}
      {editUser && (
        <Modal title={`Editar — ${editUser.nombre} ${editUser.apellido}`} onClose={() => setEditUser(null)} wide>
          <AdminUserForm u={editUser} setter={setEditUser} />
          <div className="mt-4">
            <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Permisos de acceso</p>
            <AdminPermCheckboxes u={editUser} setter={setEditUser} />
          </div>
          <div className="flex gap-3 mt-5">
            <button onClick={() => setEditUser(null)} className="flex-1 rounded-xl py-2.5 text-sm font-medium text-slate-600 border border-slate-200 hover:bg-slate-50">Cancelar</button>
            <GreenBtn label="Guardar Cambios" onClick={saveEdit} />
          </div>
        </Modal>
      )}

      {/* Add user */}
      {showAdd && (
        <Modal title="Nuevo Usuario" onClose={() => setShowAdd(false)} wide>
          <AdminUserForm u={newUser} setter={setNewUser} />
          <div className="mt-4">
            <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Permisos de acceso</p>
            <AdminPermCheckboxes u={newUser} setter={setNewUser} />
          </div>
          <div className="flex gap-3 mt-5">
            <button onClick={() => setShowAdd(false)} className="flex-1 rounded-xl py-2.5 text-sm font-medium text-slate-600 border border-slate-200 hover:bg-slate-50">Cancelar</button>
            <GreenBtn label="Crear Usuario" onClick={addUser} />
          </div>
        </Modal>
      )}
    </div>
  )
}

// ─── Page: Inicio ─────────────────────────────────────────────────────────────

function PageInicio({ user, pedidos, registros, noticias, onNav, onUpdateUser }: { user: SysUser; pedidos: Pedido[]; registros: MantRegistro[]; noticias: Noticia[]; onNav: (p: Page) => void; onUpdateUser?: (u: SysUser) => void }) {
  const { notes, add, toggle, remove, edit } = useNotes()
  const [noteText, setNoteText] = useState('')
  const [noteDue, setNoteDue] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editText, setEditText] = useState('')
  const [editDue, setEditDue] = useState('')
  const [avatarEditorSrc, setAvatarEditorSrc] = useState<string | null>(null)
  const activos = registros.filter(r => !r.deleted)
  const overdueRegs = activos.filter(r => isOverdue(r.proximoMant))
  const soon = activos.filter(r => { const d = new Date(r.proximoMant); return !isNaN(d.getTime()) && d >= new Date() && d <= new Date(Date.now() + 7 * 86400000) })

  const stats = [
    { label: 'Pedidos Activos', val: pedidos.filter(p => p.estado !== 'terminado').length, icon: '📦', dot: 'green' as const, nav: 'pedidos' as Page },
    { label: 'En Inspección', val: pedidos.filter(p => p.estado === 'en_inspeccion').length, icon: '🔍', dot: 'amber' as const, nav: 'pedidos' as Page },
    { label: 'Mant. Próximos', val: soon.length, icon: '🔧', dot: 'amber' as const, nav: 'mantenimientos' as Page },
    { label: 'Mant. Vencidos', val: overdueRegs.length, icon: '⚠️', dot: 'red' as const, nav: 'mantenimientos' as Page },
  ]

  return (
    <div className="p-8 flex flex-col gap-6 max-w-4xl mx-auto w-full page-enter">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-slate-800" style={{ fontFamily: 'Outfit,sans-serif' }}>Bienvenido, {user.nombre} 👋</h1>
        <p className="text-slate-500 text-sm">{new Date().toLocaleDateString('es-CL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      {/* Profile + weather */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 rounded-2xl p-6 flex gap-6 items-center text-white card-hover" style={{ background: 'linear-gradient(135deg,#154d38,#1e6b4a)' }}>
          <label className="w-32 h-48 rounded-2xl flex-shrink-0 overflow-hidden flex items-center justify-center text-5xl font-bold cursor-pointer relative group self-center" style={{ background: 'rgba(255,255,255,0.2)' }} title="Cambiar foto">
            {user.foto ? <img src={user.foto} className="w-full h-full object-cover" alt="avatar" /> : <span>{user.avatar}</span>}
            <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl">
              <span className="text-white text-base">📷</span>
              <span className="text-white text-[10px] font-semibold">Cambiar</span>
            </div>
            <input type="file" accept="image/*" className="hidden" onChange={e => {
              const f = e.target.files?.[0]; if (!f) return
              const r = new FileReader(); r.onload = ev => { if (ev.target?.result) setAvatarEditorSrc(ev.target.result as string) }; r.readAsDataURL(f)
              e.target.value = ''
            }} />
          </label>
          {avatarEditorSrc && (
            <AvatarEditor
              src={avatarEditorSrc}
              onSave={dataUrl => { if (onUpdateUser) onUpdateUser({ ...user, foto: dataUrl }); setAvatarEditorSrc(null) }}
              onClose={() => setAvatarEditorSrc(null)}
            />
          )}
          <div className="flex-1 min-w-0">
            <div className="text-xl font-bold" style={{ fontFamily: 'Outfit,sans-serif' }}>{user.nombre} {user.apellido}</div>
            <div className="text-brand-300 text-sm">{user.rol}</div>
            <div className="text-white/60 text-sm">{user.departamento}</div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {[['Email', user.email], ['Teléfono', user.telefono], ['Ingreso', user.fechaIngreso], ['Cumpleaños', user.cumpleanos]].map(([k, v]) => (
                <div key={k} className="rounded-xl px-3 py-2" style={{ background: 'rgba(255,255,255,0.12)' }}>
                  <div className="text-white/50 text-[10px] uppercase tracking-wider">{k}</div>
                  <div className="text-white text-xs font-medium truncate">{v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <WeatherWidget />
      </div>

      {/* Stat cards — clickable, navigate to section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(s => (
          <button key={s.label} onClick={() => onNav(s.nav)} className="rounded-2xl p-4 text-left card-hover cursor-pointer border border-white/60 hover:border-brand-300 transition-all" style={{ background: 'rgba(255,255,255,0.82)', backdropFilter: 'blur(8px)', boxShadow: '0 4px 18px rgba(0,0,0,0.08)' }}>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">{s.icon}</span>
              <PulseDot color={s.dot} />
            </div>
            <div className="text-2xl font-bold text-slate-800" style={{ fontFamily: 'Outfit,sans-serif' }}>{s.val}</div>
            <div className="text-slate-500 text-xs mt-0.5">{s.label}</div>
            <div className="text-brand-600 text-[10px] mt-1 font-medium">Ver sección →</div>
          </button>
        ))}
      </div>

      {/* Últimas noticias publicadas */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-slate-800" style={{ fontFamily: 'Outfit,sans-serif' }}>📢 Últimas Noticias</h2>
          <button onClick={() => onNav('informacion')} className="text-brand-600 text-xs font-semibold hover:underline">Ver todas →</button>
        </div>
        {noticias.length === 0 ? (
          <div className="text-center text-slate-400 text-sm py-8 border-2 border-dashed border-slate-100 rounded-xl">Sin noticias publicadas aún.</div>
        ) : (
          <div className="flex flex-col gap-3">
            {noticias.slice(0, 3).map(n => (
              <div key={n.id} className="rounded-xl p-4 border border-slate-100 bg-slate-50">
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-white text-[10px] font-semibold px-2.5 py-1 rounded-full ${TIPO_NOT_COLOR[n.tipo]}`}>{TIPO_NOT_LABEL[n.tipo]}</span>
                  <span className="text-slate-400 text-xs">{n.fecha}</span>
                </div>
                <h3 className="text-slate-800 font-semibold text-sm mb-1">{n.titulo}</h3>
                <p className="text-slate-600 text-xs leading-relaxed line-clamp-2">{n.cuerpo}</p>
                <div className="mt-2 text-[10px] text-slate-400">Publicado por <span className="font-medium text-slate-600">{n.autor}</span></div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Notepad */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h2 className="font-bold text-slate-800 mb-4" style={{ fontFamily: 'Outfit,sans-serif' }}>📝 Notas y Pendientes</h2>
        {/* Add note form */}
        <div className="flex flex-col gap-2 mb-4">
          <div className="flex gap-2">
            <input
              value={noteText} onChange={e => setNoteText(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { add(noteText, noteDue); setNoteText(''); setNoteDue('') } }}
              placeholder="Escribe una nota rápida y presiona Enter..."
              className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500 bg-slate-50"
            />
            <GreenBtn label="+ Agregar" onClick={() => { add(noteText, noteDue); setNoteText(''); setNoteDue('') }} />
          </div>
        </div>
        {/* Legend */}
        <div className="flex items-center gap-4 mb-3 text-xs text-slate-400">
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" /> A tiempo</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" /> Por vencer (≤2 días)</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" /> Vencido</span>
        </div>
        {notes.length === 0 ? (
          <div className="text-center text-slate-400 text-sm py-8 border-2 border-dashed border-slate-100 rounded-xl">Sin notas aún. Agrega tu primera tarea.</div>
        ) : (
          <div className="flex flex-col gap-2 max-h-72 overflow-y-auto">
            {notes.map(n => {
              const light = noteLight(n.dueDate)
              const isEditing = editingId === n.id
              return (
                <div key={n.id} className={`flex items-start gap-3 p-3 rounded-xl border transition-all ${n.done ? 'bg-slate-50 border-slate-100 opacity-70' : light === 'red' ? 'bg-red-50 border-red-200' : light === 'amber' ? 'bg-amber-50 border-amber-200' : 'bg-brand-50 border-brand-100'}`}>
                  {/* Checkbox */}
                  <button onClick={() => toggle(n.id)} className={`w-5 h-5 rounded-md border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-colors ${n.done ? 'bg-brand-500 border-brand-500 text-white' : 'border-slate-300 hover:border-brand-400'}`}>
                    {n.done && <span className="text-[10px] font-bold">✓</span>}
                  </button>
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {isEditing ? (
                      <div className="flex flex-col gap-1.5">
                        <input value={editText} onChange={e => setEditText(e.target.value)} className="w-full rounded-lg border border-brand-300 px-2 py-1 text-sm outline-none bg-white" autoFocus />
                        <div className="flex items-center gap-2">
                          <label className="text-xs text-slate-400">📅</label>
                          <input type="date" value={editDue} onChange={e => setEditDue(e.target.value)} className="rounded-lg border border-slate-200 px-2 py-1 text-xs outline-none bg-white" />
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => { edit(n.id, editText, editDue); setEditingId(null) }} className="text-[10px] bg-brand-600 text-white px-2.5 py-1 rounded-lg font-semibold">Guardar</button>
                          <button onClick={() => setEditingId(null)} className="text-[10px] bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg">Cancelar</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-start gap-2">
                          {light && <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1 pulse-dot ${light === 'red' ? 'bg-red-500' : light === 'amber' ? 'bg-amber-400' : 'bg-emerald-400'}`} />}
                          <p className={`text-sm leading-snug ${n.done ? 'line-through text-slate-400' : 'text-slate-700'}`}>{n.text}</p>
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          <p className="text-[10px] text-slate-400">{n.at}</p>
                        </div>
                      </>
                    )}
                  </div>
                  {/* Actions */}
                  {!isEditing && (
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button onClick={() => { setEditingId(n.id); setEditText(n.text); setEditDue(n.dueDate ?? '') }} className="text-slate-300 hover:text-brand-500 transition-colors text-sm">✏️</button>
                      <button onClick={() => remove(n.id)} className="text-slate-300 hover:text-red-400 transition-colors text-lg leading-none">×</button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Page: Información ────────────────────────────────────────────────────────

function PageInformacion({ user, noticias, setNoticias, sugerencias, setSugerencias }: { user: SysUser; noticias: Noticia[]; setNoticias: React.Dispatch<React.SetStateAction<Noticia[]>>; sugerencias: Sugerencia[]; setSugerencias: React.Dispatch<React.SetStateAction<Sugerencia[]>> }) {
  const isAdmin = user.permisos.includes('admin')
  const canPublish = isAdmin || !!user.canPublish
  const [nueva, setNueva] = useState('')
  const [filtro, setFiltro] = useState('todas')
  const [showAddNoticia, setShowAddNoticia] = useState(false)
  const [formN, setFormN] = useState({ titulo: '', cuerpo: '', tipo: 'comunicado', imagen: '' })

  const filtered = filtro === 'todas' ? noticias : noticias.filter(n => n.tipo === filtro)

  const addNoticia = () => {
    if (!formN.titulo || !formN.cuerpo) return
    setNoticias(prev => [{ id: Date.now(), titulo: formN.titulo, cuerpo: formN.cuerpo, autor: `${user.nombre} ${user.apellido}`, rol: user.rol, fecha: 'Ahora', tipo: formN.tipo as any, imagen: formN.imagen || undefined }, ...prev])
    setFormN({ titulo: '', cuerpo: '', tipo: 'comunicado', imagen: '' }); setShowAddNoticia(false)
  }
  const addSugerencia = () => {
    if (!nueva.trim()) return
    setSugerencias(prev => [{ id: Date.now(), texto: nueva.trim(), autor: `${user.nombre} ${user.apellido}`, fecha: 'Ahora', estado: 'pendiente' }, ...prev])
    setNueva('')
  }
  const markRevisada = (id: number) => setSugerencias(p => p.map(s => s.id === id ? { ...s, estado: 'revisada' } : s))
  const deleteSug = (id: number) => setSugerencias(p => p.filter(s => s.id !== id))

  return (
    <div className="p-8 flex flex-col gap-6 max-w-5xl mx-auto w-full page-enter">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800" style={{ fontFamily: 'Outfit,sans-serif' }}>Información</h1>
          <p className="text-slate-500 text-sm mt-0.5">Comunicados de jefaturas y sugerencias del equipo</p>
        </div>
        {canPublish && <GreenBtn label="+ Publicar noticia" onClick={() => setShowAddNoticia(true)} />}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Noticias */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="flex gap-2 flex-wrap">
            {['todas', 'seguridad', 'operacional', 'comunicado', 'admin'].map(f => (
              <button key={f} onClick={() => setFiltro(f)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border btn-hover ${filtro === f ? 'border-brand-600 bg-brand-600 text-white' : 'border-slate-200 bg-white text-slate-600 hover:border-brand-400'}`}>
                {f === 'todas' ? 'Todas' : TIPO_NOT_LABEL[f]}
              </button>
            ))}
          </div>
          {filtered.length === 0 && (
            <div className="text-center text-slate-400 text-sm py-10 border-2 border-dashed border-slate-100 rounded-2xl">Sin publicaciones en esta categoría.</div>
          )}
          {filtered.map(n => (
            <div key={n.id} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm card-hover">
              <div className="flex items-center justify-between mb-3">
                <span className={`text-white text-[10px] font-semibold px-2.5 py-1 rounded-full ${TIPO_NOT_COLOR[n.tipo]}`}>{TIPO_NOT_LABEL[n.tipo]}</span>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 text-xs">{n.fecha}</span>
                  {isAdmin && (
                    <button onClick={() => setNoticias(prev => prev.filter(x => x.id !== n.id))} className="btn-hover text-[10px] bg-red-50 text-red-500 px-2 py-1 rounded-lg hover:bg-red-100 font-semibold">🗑️ Eliminar</button>
                  )}
                </div>
              </div>
              <h3 className="text-slate-800 font-semibold text-sm mb-2">{n.titulo}</h3>
              {n.imagen && <img src={n.imagen} alt="" className="w-full h-40 object-cover rounded-xl mb-3" />}
              <p className="text-slate-600 text-sm leading-relaxed">{n.cuerpo}</p>
              <div className="mt-3 pt-3 border-t border-slate-50 text-xs text-slate-400">
                Publicado por <span className="font-medium text-slate-600">{n.autor}</span> — {n.rol}
              </div>
            </div>
          ))}
        </div>

        {/* Sugerencias */}
        <div className="flex flex-col gap-4">
          <h2 className="text-slate-700 font-semibold">💡 Sugerencias</h2>
          <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
            <textarea value={nueva} onChange={e => setNueva(e.target.value)} placeholder="Escribe tu sugerencia..." rows={3} className="w-full text-sm text-slate-700 resize-none outline-none bg-slate-50 rounded-xl p-3 border border-slate-200 focus:border-brand-400 transition-colors" />
            <button onClick={addSugerencia} className="btn-hover mt-2 w-full rounded-xl py-2.5 text-sm font-semibold text-white hover:opacity-90" style={{ background: 'linear-gradient(135deg,#2a8a5e,#154d38)' }}>Enviar sugerencia</button>
          </div>
          {sugerencias.map(s => (
            <div key={s.id} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm card-hover">
              <p className="text-slate-700 text-sm leading-relaxed">"{s.texto}"</p>
              <div className="mt-2 flex items-center justify-between">
                <div className="text-xs text-slate-400">{s.autor} · {s.fecha}</div>
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${s.estado === 'revisada' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{s.estado === 'revisada' ? 'Revisada' : 'Pendiente'}</span>
              </div>
              {/* Admin-only actions */}
              {isAdmin && (
                <div className="mt-2 flex gap-2 pt-2 border-t border-slate-50">
                  {s.estado === 'pendiente' && (
                    <button onClick={() => markRevisada(s.id)} className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-1 rounded-lg hover:bg-emerald-100 transition-colors font-semibold">Marcar revisada</button>
                  )}
                  <button onClick={() => deleteSug(s.id)} className="text-[10px] bg-red-50 text-red-600 px-2 py-1 rounded-lg hover:bg-red-100 transition-colors font-semibold">Eliminar</button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {showAddNoticia && (
        <Modal title="Publicar Noticia" onClose={() => setShowAddNoticia(false)} wide>
          <div className="flex flex-col gap-4">
            <InputField label="Título" value={formN.titulo} onChange={v => setFormN(p => ({ ...p, titulo: v }))} placeholder="Título del comunicado" />
            <SelectField label="Tipo" value={formN.tipo} onChange={v => setFormN(p => ({ ...p, tipo: v }))}>
              {Object.entries(TIPO_NOT_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </SelectField>
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">Contenido</label>
              <textarea value={formN.cuerpo} onChange={e => setFormN(p => ({ ...p, cuerpo: e.target.value }))} rows={4} placeholder="Escribe el contenido..." className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-brand-400 bg-slate-50 resize-none" />
            </div>
            <ImageUpload label="Imagen adjunta (opcional)" value={formN.imagen} onChange={v => setFormN(p => ({ ...p, imagen: v }))} />
            <div className="flex gap-3">
              <button onClick={() => setShowAddNoticia(false)} className="flex-1 rounded-xl py-2.5 text-sm font-medium text-slate-600 border border-slate-200 hover:bg-slate-50">Cancelar</button>
              <GreenBtn label="Publicar" onClick={addNoticia} />
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

// ─── Page: Pedidos ────────────────────────────────────────────────────────────

function PagePedidos({ user, pedidos, setPedidos, allPedidos }: { user: SysUser; pedidos: Pedido[]; setPedidos: React.Dispatch<React.SetStateAction<Pedido[]>>; allPedidos: Pedido[] }) {
  const [showAdd, setShowAdd] = useState(false)
  const [detalle, setDetalle] = useState<Pedido | null>(null)
  const [logForm, setLogForm] = useState({ tipo: 'nota', desc: '', img: '' })
  const [busqueda, setBusqueda] = useState('')
  const [filtroEstado, setFiltroEstado] = useState<string>('todos')
  const [tabPedidos, setTabPedidos] = useState<'activos' | 'papelera'>('activos')
  const [form, setForm] = useState({ empresa: '', oc: '', material: MATERIALES[0].nombre, cantidad: '', fechaInicio: '', fechaFin: '' })
  const matMap = Object.fromEntries(MATERIALES.map(m => [m.nombre, m.pesoKg]))
  const totalKgPrev = (matMap[form.material] ?? 0) * (Number(form.cantidad) || 0)

  const activosPed = pedidos.filter(p => !p.deleted)
  const papeleraPed = pedidos.filter(p => p.deleted)

  const softDeletePed = (id: string) => {
    setPedidos(prev => prev.map(p => p.id === id ? { ...p, deleted: true, deletedBy: `${user.nombre} ${user.apellido}`, deletedAt: `${nowDate()} ${nowTime()}` } : p))
    setDetalle(null)
  }
  const restorePed = (id: string) => setPedidos(prev => prev.map(p => p.id === id ? { ...p, deleted: false, deletedBy: undefined, deletedAt: undefined } : p))
  const permanentDeletePed = (id: string) => setPedidos(prev => prev.filter(p => p.id !== id))

  const addPedido = () => {
    if (!form.empresa || !form.oc || !form.cantidad || !form.fechaInicio || !form.fechaFin) return
    const cant = Number(form.cantidad), peso = matMap[form.material]
    const np: Pedido = {
      id: (() => { const year = new Date().getFullYear(); const nums = allPedidos.map(p => { const m = p.id.match(/PC-\d{4}-(\d+)/); return m ? parseInt(m[1]) : 0 }); const next = (Math.max(0, ...nums) + 1); return `PC-${year}-${String(next).padStart(3, '0')}` })(),
      empresa: form.empresa, oc: form.oc, material: form.material, pesoUnitKg: peso,
      cantidad: cant, totalKg: cant * peso, fechaInicio: form.fechaInicio, fechaFin: form.fechaFin,
      estado: 'ingresado', solicitante: `${user.nombre} ${user.apellido}`, fechaCreacion: nowDate(), userId: user.id,
      bitacora: [{ id: 1, fecha: nowDate(), hora: nowTime(), tipo: 'creacion', descripcion: 'Pedido creado en el sistema', usuario: `${user.nombre} ${user.apellido}` }],
      auditoria: [mkAudit(user, 'Creó el pedido')],
    }
    setPedidos(prev => [np, ...prev])
    setForm({ empresa: '', oc: '', material: MATERIALES[0].nombre, cantidad: '', fechaInicio: '', fechaFin: '' }); setShowAdd(false)
  }

  const changeEstado = (ped: Pedido, next: PedidoEstado) => {
    const log: PedidoLog = { id: Date.now(), fecha: nowDate(), hora: nowTime(), tipo: 'estado', descripcion: `Estado: "${ESTADO_PED_LABEL[ped.estado]}" → "${ESTADO_PED_LABEL[next]}"`, usuario: `${user.nombre} ${user.apellido}` }
    setPedidos(prev => prev.map(p => p.id === ped.id ? { ...p, estado: next, bitacora: [...p.bitacora, log], auditoria: [...p.auditoria, mkAudit(user, `Cambió estado a ${ESTADO_PED_LABEL[next]}`)] } : p))
    setDetalle(d => d?.id === ped.id ? { ...d, estado: next, bitacora: [...d.bitacora, log] } : d)
  }
  const advance = (ped: Pedido) => { const next = ESTADO_PED_NEXT[ped.estado]; if (next) changeEstado(ped, next) }
  const retreat = (ped: Pedido) => { const prev = ESTADO_PED_PREV[ped.estado]; if (prev) changeEstado(ped, prev) }

  const addLog = () => {
    if (!detalle || !logForm.desc.trim()) return
    const log: PedidoLog = { id: Date.now(), fecha: nowDate(), hora: nowTime(), tipo: logForm.tipo as any, descripcion: logForm.desc.trim(), usuario: `${user.nombre} ${user.apellido}`, imagen: logForm.img || undefined }
    setPedidos(prev => prev.map(p => p.id === detalle.id ? { ...p, bitacora: [...p.bitacora, log], auditoria: [...p.auditoria, mkAudit(user, `Registró ${LOG_LABEL[logForm.tipo]}`, logForm.desc)] } : p))
    setDetalle(d => d ? { ...d, bitacora: [...d.bitacora, log] } : d); setLogForm({ tipo: 'nota', desc: '', img: '' })
  }

  const filtered = activosPed.filter(p => {
    const q = busqueda.toLowerCase()
    return (filtroEstado === 'todos' || p.estado === filtroEstado) && (!q || p.empresa.toLowerCase().includes(q) || p.oc.toLowerCase().includes(q) || p.material.toLowerCase().includes(q))
  })
  const hoy = nowDate()
  const hoyCount = activosPed.flatMap(p => p.bitacora.filter(l => l.fecha === hoy)).length

  return (
    <div className="p-8 max-w-7xl mx-auto w-full page-enter">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800" style={{ fontFamily: 'Outfit,sans-serif' }}>📦 Control de Pedidos</h1>
          <p className="text-slate-500 text-sm mt-0.5">Órdenes de producción y seguimiento</p>
        </div>
        <GreenBtn label="+ Nuevo Pedido" onClick={() => setShowAdd(true)} />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {(['activos', 'papelera'] as const).map(t => (
          <button key={t} onClick={() => setTabPedidos(t)} className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all btn-hover border ${tabPedidos === t ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-slate-600 border-slate-200 hover:border-brand-300'}`}>
            {t === 'activos' ? `Pedidos activos (${activosPed.length})` : `🗑️ Papelera (${papeleraPed.length})`}
          </button>
        ))}
      </div>

      {tabPedidos === 'papelera' ? (
        <div className="flex flex-col gap-4">
          {papeleraPed.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 p-10 text-center text-slate-400"><div className="text-3xl mb-2">🗑️</div><div className="text-sm">La papelera está vacía.</div></div>
          ) : papeleraPed.map(p => (
            <div key={p.id} className="bg-red-50 rounded-2xl border border-red-200 p-5 opacity-85">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-bold text-slate-700">{p.empresa}</div>
                  <div className="font-mono text-xs text-slate-500">{p.id} · OC: {p.oc}</div>
                  <div className="text-xs text-red-600 mt-1">Eliminado por <span className="font-semibold">{p.deletedBy}</span> el {p.deletedAt}</div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => restorePed(p.id)} className="btn-hover text-xs bg-white text-brand-700 border border-brand-200 px-3 py-1.5 rounded-lg hover:bg-brand-50 font-semibold">♻️ Restaurar</button>
                  <button onClick={() => permanentDeletePed(p.id)} className="btn-hover text-xs bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700 font-semibold">🗑️ Eliminar definitivo</button>
                </div>
              </div>
              <div className="mt-2 flex gap-3 text-xs text-slate-500">
                <span>{p.material}</span><span>·</span><span>{p.cantidad} u. — {p.totalKg.toLocaleString('es-CL')} kg</span><span>·</span>
                <span className={`font-medium px-2 py-0.5 rounded-full border ${ESTADO_PED_COLOR[p.estado]}`}>{ESTADO_PED_LABEL[p.estado]}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-5">
        {(['todos', 'ingresado', 'en_proceso', 'en_inspeccion', 'terminado'] as const).map(e => (
          <button key={e} onClick={() => setFiltroEstado(e)} className={`rounded-xl p-3 text-left border transition-all btn-hover ${filtroEstado === e ? 'border-brand-500 bg-brand-50' : 'border-slate-100 bg-white hover:border-brand-300'}`}>
            <div className="flex items-center gap-2">
              <div className="text-xl font-bold text-slate-800" style={{ fontFamily: 'Outfit,sans-serif' }}>{e === 'todos' ? activosPed.length : activosPed.filter(p => p.estado === e).length}</div>
              {e !== 'todos' && <PulseDot color={e === 'terminado' ? 'green' : e === 'en_inspeccion' ? 'amber' : 'green'} />}
            </div>
            <div className="text-slate-500 text-xs">{e === 'todos' ? 'Total' : ESTADO_PED_LABEL[e]}</div>
          </button>
        ))}
      </div>

      {hoyCount > 0 && (
        <div className="bg-brand-50 border border-brand-200 rounded-2xl p-4 mb-4 flex items-center gap-3">
          <span className="text-xl">📊</span>
          <div className="text-brand-800 text-sm"><span className="font-semibold">{hoyCount} eventos</span> registrados en la bitácora hoy</div>
        </div>
      )}

      <div className="mb-4">
        <input type="text" placeholder="Buscar empresa, OC, material..." value={busqueda} onChange={e => setBusqueda(e.target.value)} className="w-full max-w-sm rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand-400 bg-white" />
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden card-hover">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100" style={{ background: '#f8faf9' }}>
                {['ID', 'Empresa', 'OC', 'Material', 'Cant.', 'Total Kg', 'F. Inicio', 'F. Fin', 'Estado', 'Acción', ''].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-slate-500 font-semibold text-xs uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => (
                <tr key={p.id} className={`border-b border-slate-50 hover:bg-slate-50 transition-colors ${i % 2 ? 'bg-slate-50/30' : ''}`}>
                  <td className="px-4 py-3 font-mono text-xs text-slate-600 font-medium">{p.id}</td>
                  <td className="px-4 py-3 font-medium text-slate-800 max-w-[130px]"><div className="truncate">{p.empresa}</div></td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-600">{p.oc}</td>
                  <td className="px-4 py-3 text-slate-700"><div className="truncate max-w-[110px]">{p.material}</div><div className="text-slate-400 text-[10px]">{p.pesoUnitKg} kg/u</div></td>
                  <td className="px-4 py-3 text-center font-mono text-slate-800">{p.cantidad}</td>
                  <td className="px-4 py-3 font-mono font-semibold"><span className="text-brand-700">{p.totalKg.toLocaleString('es-CL')}</span><span className="text-slate-400 text-xs"> kg</span></td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{p.fechaInicio}</td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{p.fechaFin}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <PulseDot color={p.estado === 'terminado' ? 'green' : p.estado === 'en_inspeccion' ? 'amber' : 'green'} />
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${ESTADO_PED_COLOR[p.estado]}`}>{ESTADO_PED_LABEL[p.estado]}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      {ESTADO_PED_NEXT[p.estado] && (
                        <button onClick={() => advance(p)} className="btn-hover text-[10px] bg-brand-600 text-white px-2.5 py-1.5 rounded-lg font-semibold whitespace-nowrap">
                          → {ESTADO_PED_LABEL[ESTADO_PED_NEXT[p.estado]!]}
                        </button>
                      )}
                      {ESTADO_PED_PREV[p.estado] && (
                        <button onClick={() => retreat(p)} className="btn-hover text-[10px] bg-slate-200 text-slate-700 px-2.5 py-1.5 rounded-lg font-semibold whitespace-nowrap">
                          ← {ESTADO_PED_LABEL[ESTADO_PED_PREV[p.estado]!]}
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5">
                      <button onClick={() => setDetalle(p)} className="btn-hover text-brand-600 hover:text-brand-800 text-xs font-semibold bg-brand-50 px-2.5 py-1.5 rounded-lg">Bitácora</button>
                      <button onClick={() => softDeletePed(p.id)} className="btn-hover text-red-500 text-xs font-semibold bg-red-50 px-2.5 py-1.5 rounded-lg hover:bg-red-100">🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={11} className="px-4 py-10 text-center text-slate-400 text-sm">Sin pedidos. Usa "+ Nuevo Pedido" para comenzar.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add modal */}
      {showAdd && (
        <Modal title="Nuevo Pedido" onClose={() => setShowAdd(false)}>
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2"><InputField label="Nombre Empresa" value={form.empresa} onChange={v => setForm(p => ({ ...p, empresa: v }))} placeholder="Ej: Constructora Austral" /></div>
              <InputField label="OC (Orden de Compra)" value={form.oc} onChange={v => setForm(p => ({ ...p, oc: v }))} placeholder="OC-0447" />
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">Material / Tipo</label>
                <select value={form.material} onChange={e => setForm(p => ({ ...p, material: e.target.value }))} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-brand-400 bg-slate-50">
                  {MATERIALES.map(m => <option key={m.nombre} value={m.nombre}>{m.nombre} — {m.pesoKg} kg/u</option>)}
                </select>
              </div>
              <div>
                <InputField label="Cantidad (unidades)" value={form.cantidad} onChange={v => setForm(p => ({ ...p, cantidad: v }))} type="number" placeholder="0" />
                {form.cantidad && <p className="text-brand-700 text-xs mt-1 font-semibold">= {totalKgPrev.toLocaleString('es-CL')} kg totales</p>}
              </div>
              <div className="bg-brand-50 rounded-xl p-3 flex items-center justify-center flex-col">
                <div className="text-brand-800 text-2xl font-bold" style={{ fontFamily: 'Outfit,sans-serif' }}>{totalKgPrev.toLocaleString('es-CL')}</div>
                <div className="text-brand-600 text-xs font-medium">Total kg</div>
              </div>
              <InputField label="Fecha Inicio" value={form.fechaInicio} onChange={v => setForm(p => ({ ...p, fechaInicio: v }))} type="date" />
              <InputField label="Fecha Fin / Entrega" value={form.fechaFin} onChange={v => setForm(p => ({ ...p, fechaFin: v }))} type="date" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowAdd(false)} className="flex-1 rounded-xl py-2.5 text-sm font-medium text-slate-600 border border-slate-200 hover:bg-slate-50">Cancelar</button>
              <GreenBtn label="Crear Pedido" onClick={addPedido} />
            </div>
          </div>
        </Modal>
      )}

      {/* Bitácora modal */}
      {detalle && (
        <Modal title={`Bitácora — ${detalle.empresa}`} onClose={() => setDetalle(null)} wide>
          <div className="grid grid-cols-2 gap-3 mb-5 bg-slate-50 rounded-xl p-4 text-sm">
            <div><span className="text-slate-400 text-xs">Empresa</span><div className="font-semibold">{detalle.empresa}</div></div>
            <div><span className="text-slate-400 text-xs">OC</span><div className="font-mono">{detalle.oc}</div></div>
            <div><span className="text-slate-400 text-xs">Material</span><div>{detalle.material}</div></div>
            <div><span className="text-slate-400 text-xs">Total</span><div className="font-bold text-brand-700">{detalle.totalKg.toLocaleString('es-CL')} kg</div></div>
            <div><span className="text-slate-400 text-xs">F. Inicio</span><div>{detalle.fechaInicio}</div></div>
            <div><span className="text-slate-400 text-xs">F. Fin</span><div>{detalle.fechaFin}</div></div>
            <div className="col-span-2">
              <span className="text-slate-400 text-xs">Estado actual</span>
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                <PulseDot color={detalle.estado === 'terminado' ? 'green' : 'amber'} />
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${ESTADO_PED_COLOR[detalle.estado]}`}>{ESTADO_PED_LABEL[detalle.estado]}</span>
                {ESTADO_PED_PREV[detalle.estado] && <button type="button" onClick={() => retreat(detalle)} className="btn-hover text-[10px] bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg font-semibold">← Retroceder</button>}
                {ESTADO_PED_NEXT[detalle.estado] && <button type="button" onClick={() => advance(detalle)} className="btn-hover text-[10px] bg-brand-600 text-white px-3 py-1.5 rounded-lg font-semibold">→ Avanzar</button>}
              </div>
            </div>
          </div>
          <div className="mb-4">
            <h3 className="font-semibold text-slate-700 text-sm mb-3">Registrar evento</h3>
            <div className="flex gap-2 mb-2 flex-wrap">
              {(['nota', 'falla', 'atraso'] as const).map(t => (
                <button key={t} onClick={() => setLogForm(f => ({ ...f, tipo: t }))} className={`btn-hover px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${logForm.tipo === t ? 'bg-slate-700 text-white border-slate-700' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'}`}>{LOG_LABEL[t]}</button>
              ))}
            </div>
            <div className="flex gap-2">
              <textarea value={logForm.desc} onChange={e => setLogForm(f => ({ ...f, desc: e.target.value }))} rows={2} placeholder="Describe el evento..." className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400 bg-slate-50 resize-none" />
              <div className="flex flex-col gap-2 items-end">
                <label className="cursor-pointer text-[11px] text-brand-600 font-semibold bg-brand-50 px-2.5 py-1.5 rounded-lg border border-brand-200 hover:bg-brand-100 transition-colors">
                  {logForm.img ? '📷 ✓' : '📷 Foto'}
                  <input type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (!f) return; const r = new FileReader(); r.onload = ev => setLogForm(x => ({ ...x, img: ev.target?.result as string })); r.readAsDataURL(f) }} />
                </label>
                <GreenBtn label="Agregar" onClick={addLog} small />
              </div>
            </div>
            {logForm.img && <div className="relative mt-1 inline-block"><img src={logForm.img} className="h-16 rounded-lg object-cover border border-slate-200" alt="preview" /><button type="button" onClick={() => setLogForm(f => ({ ...f, img: '' }))} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 text-[10px] flex items-center justify-center">×</button></div>}
          </div>
          <h3 className="font-semibold text-slate-700 text-sm mb-3">Línea de tiempo</h3>
          <div className="flex flex-col gap-2 max-h-72 overflow-y-auto">
            {[...detalle.bitacora].reverse().map(l => (
              <div key={l.id} className="flex gap-3 items-start group">
                <div className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${LOG_COLOR[l.tipo]}`} />
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-semibold text-slate-500 uppercase">{LOG_LABEL[l.tipo]}</span>
                    <span className="text-[10px] text-slate-400">{l.fecha} {l.hora} · {l.usuario}</span>
                  </div>
                  <p className="text-sm text-slate-700">{l.descripcion}</p>
                  {l.imagen && <BitacoraImg src={l.imagen} />}
                </div>
                {(user.permisos.includes('admin') || user.canDeleteBitacora) && l.tipo !== 'creacion' && (
                  <button type="button" onClick={() => {
                    const updated = detalle.bitacora.filter(x => x.id !== l.id)
                    setPedidos(prev => prev.map(p => p.id === detalle.id ? { ...p, bitacora: updated } : p))
                    setDetalle({ ...detalle, bitacora: updated })
                  }} className="text-slate-300 hover:text-red-400 transition-colors text-sm opacity-0 group-hover:opacity-100 flex-shrink-0">×</button>
                )}
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 flex justify-end">
            <button onClick={() => softDeletePed(detalle.id)} className="btn-hover text-xs bg-red-50 text-red-600 px-3 py-2 rounded-xl hover:bg-red-100 font-semibold border border-red-200">🗑️ Mover a papelera</button>
          </div>
        </Modal>
      )}
        </>
      )}
    </div>
  )
}

// ─── Page: Mantenimientos ─────────────────────────────────────────────────────

function BitacoraImg({ src }: { src: string }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <img src={src} className="h-16 mt-1.5 rounded-lg object-cover border border-slate-200 cursor-zoom-in hover:opacity-90 transition-opacity" alt="adjunto" onClick={() => setOpen(true)} />
      {open && <Lightbox src={src} onClose={() => setOpen(false)} />}
    </>
  )
}

function Lightbox({ src, onClose }: { src: string; onClose: () => void }) {
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', fn)
    return () => document.removeEventListener('keydown', fn)
  }, [onClose])
  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.9)' }} onClick={onClose}>
      <button onClick={onClose} className="absolute top-5 right-5 text-white text-3xl font-bold leading-none opacity-80 hover:opacity-100">×</button>
      <img src={src} className="max-w-[90vw] max-h-[90vh] object-contain rounded-xl shadow-2xl" onClick={e => e.stopPropagation()} alt="imagen ampliada" />
    </div>,
    document.body
  )
}

function MantImageRow({ imagen, facturaImg, nroFactura }: { imagen?: string; facturaImg?: string; nroFactura?: string }) {
  const [lightbox, setLightbox] = useState<string | null>(null)
  return (
    <div className="flex flex-wrap gap-4 mb-3">
      {imagen && (
        <div>
          <div className="text-xs text-slate-400 mb-1">Foto del trabajo</div>
          <img src={imagen} className="h-20 w-28 object-cover rounded-xl border border-slate-200 cursor-zoom-in hover:opacity-90 transition-opacity" alt="foto" onClick={() => setLightbox(imagen)} />
        </div>
      )}
      {facturaImg && (
        <div>
          <div className="text-xs text-slate-400 mb-1">Factura {nroFactura && <span className="font-mono font-semibold">#{nroFactura}</span>}</div>
          <img src={facturaImg} className="h-20 w-28 object-cover rounded-xl border border-slate-200 cursor-zoom-in hover:opacity-90 transition-opacity" alt="factura" onClick={() => setLightbox(facturaImg)} />
        </div>
      )}
      {lightbox && <Lightbox src={lightbox} onClose={() => setLightbox(null)} />}
    </div>
  )
}

function PageMantenimientos({ user, registros, setRegistros }: { user: SysUser; registros: MantRegistro[]; setRegistros: React.Dispatch<React.SetStateAction<MantRegistro[]>> }) {
  const activos = registros.filter(r => !r.deleted)
  const papelera = registros.filter(r => r.deleted)
  const equipos = Array.from(new Set(activos.map(r => r.equipoNombre))).sort()
  const [selectedEq, setSelectedEq] = useState<string>(equipos[0] ?? '')
  const [tab, setTab] = useState<'registros' | 'papelera'>('registros')
  const [showAdd, setShowAdd] = useState(false)
  const [editReg, setEditReg] = useState<MantRegistro | null>(null)
  const [auditView, setAuditView] = useState<MantRegistro | null>(null)

  // Add form state
  const [form, setForm] = useState({ equipoNombre: '', equipoCodigo: '', fecha: '', proximoMant: '', descripcion: '', responsable: `${user.nombre} ${user.apellido}`, nroFactura: '', imagen: '', facturaImg: '' })
  const [accs, setAccs] = useState<MantAccesorio[]>([])
  const [accForm, setAccForm] = useState({ nombre: '', codigo: '', cantidad: '1' })

  const resetForm = () => {
    setForm({ equipoNombre: '', equipoCodigo: '', fecha: '', proximoMant: '', descripcion: '', responsable: `${user.nombre} ${user.apellido}`, nroFactura: '', imagen: '', facturaImg: '' })
    setAccs([]); setAccForm({ nombre: '', codigo: '', cantidad: '1' })
  }

  const addAccesorio = () => {
    if (!accForm.nombre || !accForm.codigo) return
    setAccs(prev => [...prev.filter(a => a.codigo !== accForm.codigo), { nombre: accForm.nombre, codigo: accForm.codigo, cantidad: Number(accForm.cantidad) || 1 }])
    setAccForm({ nombre: '', codigo: '', cantidad: '1' })
  }

  const saveNew = () => {
    if (!form.equipoNombre || !form.fecha || !form.descripcion) return
    const reg: MantRegistro = {
      id: `MNT-${Date.now()}`, equipoNombre: form.equipoNombre, equipoCodigo: form.equipoCodigo,
      fecha: form.fecha, proximoMant: form.proximoMant, descripcion: form.descripcion, accesorios: accs,
      responsable: form.responsable || `${user.nombre} ${user.apellido}`,
      imagen: form.imagen || undefined, nroFactura: form.nroFactura || undefined, facturaImg: form.facturaImg || undefined,
      creadoPor: `${user.nombre} ${user.apellido}`, fechaCreacion: nowDate(), horaCreacion: nowTime(), auditoria: [], userId: user.id,
    }
    setRegistros(prev => [reg, ...prev])
    setSelectedEq(form.equipoNombre); resetForm(); setShowAdd(false)
  }

  const softDelete = (id: string) => {
    setRegistros(prev => prev.map(r => r.id === id ? { ...r, deleted: true, deletedBy: `${user.nombre} ${user.apellido}`, deletedAt: `${nowDate()} ${nowTime()}` } : r))
  }
  const restore = (id: string) => {
    setRegistros(prev => prev.map(r => r.id === id ? { ...r, deleted: false, deletedBy: undefined, deletedAt: undefined } : r))
  }

  const saveEdit = () => {
    if (!editReg) return
    const original = registros.find(r => r.id === editReg.id)!
    const diff = diffRegistro(original, editReg)
    const audit = mkAudit(user, 'Editó el registro', diff)
    setRegistros(prev => prev.map(r => r.id === editReg.id ? { ...editReg, auditoria: [...editReg.auditoria, audit] } : r))
    setEditReg(null)
  }

  const eqRegistros = activos.filter(r => r.equipoNombre === selectedEq)
  const overdueCount = activos.filter(r => isOverdue(r.proximoMant)).length

  // Edit accessory helpers
  const editAccs = editReg?.accesorios ?? []
  const [editAccForm, setEditAccForm] = useState({ nombre: '', codigo: '', cantidad: '1' })
  const addEditAcc = () => {
    if (!editAccForm.nombre || !editAccForm.codigo || !editReg) return
    setEditReg({ ...editReg, accesorios: [...editReg.accesorios.filter(a => a.codigo !== editAccForm.codigo), { nombre: editAccForm.nombre, codigo: editAccForm.codigo, cantidad: Number(editAccForm.cantidad) || 1 }] })
    setEditAccForm({ nombre: '', codigo: '', cantidad: '1' })
  }

  return (
    <div className="p-8 max-w-7xl mx-auto w-full page-enter">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800" style={{ fontFamily: 'Outfit,sans-serif' }}>🔧 Mantenimientos</h1>
          <p className="text-slate-500 text-sm mt-0.5">Historial de equipos, accesorios y bitácora</p>
        </div>
        <div className="flex gap-2">
          {overdueCount > 0 && (
            <div className="flex items-center gap-1.5 bg-red-50 border border-red-200 rounded-xl px-3 py-2 alert-pulse">
              <PulseDot color="red" /><span className="text-red-700 text-xs font-semibold">{overdueCount} vencido{overdueCount !== 1 ? 's' : ''}</span>
            </div>
          )}
          <GreenBtn label="+ Nuevo Registro" onClick={() => setShowAdd(true)} />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-5">
        {(['registros', 'papelera'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all btn-hover border ${tab === t ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-slate-600 border-slate-200 hover:border-brand-300'}`}>
            {t === 'registros' ? `Registros activos (${activos.length})` : `🗑️ Papelera (${papelera.length})`}
          </button>
        ))}
      </div>

      {tab === 'registros' ? (
        <div className="flex gap-6">
          {/* Equipment sidebar */}
          <div className="w-56 flex-shrink-0 flex flex-col gap-2">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-1 mb-1">Equipos</div>
            {equipos.map(eq => {
              const eqRegs = activos.filter(r => r.equipoNombre === eq)
              const hasOverdue = eqRegs.some(r => isOverdue(r.proximoMant))
              return (
                <button key={eq} onClick={() => setSelectedEq(eq)} className={`text-left rounded-xl px-4 py-3 text-sm transition-all border btn-hover ${selectedEq === eq ? (hasOverdue ? 'bg-red-600 text-white border-red-600' : 'bg-brand-600 text-white border-brand-600') : (hasOverdue ? 'bg-red-50 text-red-700 border-red-200 alert-pulse' : 'bg-white text-slate-700 border-slate-100 hover:border-brand-300 shadow-sm')}`}>
                  <div className="font-medium truncate text-xs">{eq}</div>
                  <div className={`text-[10px] flex items-center gap-1 mt-0.5 ${selectedEq === eq ? 'text-white/70' : hasOverdue ? 'text-red-500' : 'text-slate-400'}`}>
                    {hasOverdue && <PulseDot color="red" />}
                    {eqRegs.length} registro{eqRegs.length !== 1 ? 's' : ''}
                    {hasOverdue && ' · VENCIDO'}
                  </div>
                </button>
              )
            })}
            {equipos.length === 0 && <p className="text-slate-400 text-xs px-1">Sin equipos. Agrega el primero.</p>}
          </div>

          {/* Registros */}
          <div className="flex-1 min-w-0 flex flex-col gap-4">
            {eqRegistros.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-100 p-10 text-center text-slate-400">
                <div className="text-3xl mb-2">📋</div>
                <div className="text-sm">{selectedEq ? `Sin registros para "${selectedEq}".` : 'Selecciona un equipo o agrega el primero.'}</div>
              </div>
            ) : (
              eqRegistros.map(reg => {
                const overdue = isOverdue(reg.proximoMant)
                return (
                  <div key={reg.id} className={`bg-white rounded-2xl border shadow-sm p-5 card-hover ${overdue ? 'border-red-300' : 'border-slate-100'}`}>
                    {overdue && (
                      <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2 mb-3 text-red-700 text-xs font-semibold">
                        <PulseDot color="red" /> Próximo mantenimiento VENCIDO — {fmtDate(reg.proximoMant)}
                      </div>
                    )}
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="font-mono text-xs text-slate-400">{reg.id}</div>
                        <div className="font-bold text-slate-800 text-base">{reg.equipoNombre}</div>
                        <div className="font-mono text-xs text-slate-500">{reg.equipoCodigo}</div>
                      </div>
                      <div className="flex gap-2 flex-wrap justify-end">
                        <button onClick={() => setAuditView(reg)} className="btn-hover text-xs bg-slate-100 text-slate-600 px-2.5 py-1.5 rounded-lg hover:bg-slate-200">Auditoría</button>
                        <button onClick={() => { setEditReg({ ...reg }); setEditAccForm({ nombre: '', codigo: '', cantidad: '1' }) }} className="btn-hover text-xs bg-brand-50 text-brand-700 px-2.5 py-1.5 rounded-lg hover:bg-brand-100">Editar</button>
                        <button onClick={() => softDelete(reg.id)} className="btn-hover text-xs bg-red-50 text-red-600 px-2.5 py-1.5 rounded-lg hover:bg-red-100">🗑️ Eliminar</button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                      <div className="bg-slate-50 rounded-xl p-3">
                        <div className="text-xs text-slate-400 mb-0.5">Fecha Mantenimiento</div>
                        <div className="font-semibold text-slate-800">{fmtDate(reg.fecha)}</div>
                      </div>
                      <div className={`rounded-xl p-3 ${overdue ? 'bg-red-50' : 'bg-slate-50'}`}>
                        <div className={`text-xs mb-0.5 ${overdue ? 'text-red-400' : 'text-slate-400'}`}>Próximo Mantenimiento</div>
                        <div className={`font-semibold ${overdue ? 'text-red-700' : 'text-slate-800'}`}>{fmtDate(reg.proximoMant) || 'No definido'}</div>
                      </div>
                    </div>
                    <p className="text-slate-700 text-sm mb-3">{reg.descripcion}</p>

                    {reg.accesorios.length > 0 && (
                      <div className="mb-3">
                        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Accesorios utilizados</div>
                        <div className="flex flex-wrap gap-2">
                          {reg.accesorios.map(a => (
                            <div key={a.codigo} className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 flex items-center gap-2">
                              <span className="text-slate-700 text-sm font-medium">{a.nombre}</span>
                              <span className="text-slate-400 text-xs font-mono">{a.codigo}</span>
                              <span className="bg-brand-100 text-brand-700 text-xs font-bold px-1.5 py-0.5 rounded-md">×{a.cantidad}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <MantImageRow imagen={reg.imagen} facturaImg={reg.facturaImg} nroFactura={reg.nroFactura} />

                    <div className="pt-3 border-t border-slate-50 flex items-center gap-3 text-xs text-slate-400 flex-wrap">
                      <span>Creado por <span className="font-medium text-slate-600">{reg.creadoPor}</span> · {reg.fechaCreacion} {reg.horaCreacion}</span>
                      {reg.auditoria.length > 0 && <span className="text-amber-600 font-medium">{reg.auditoria.length} edición{reg.auditoria.length !== 1 ? 'es' : ''}</span>}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      ) : (
        /* Papelera */
        <div className="flex flex-col gap-4">
          {papelera.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 p-10 text-center text-slate-400">
              <div className="text-3xl mb-2">🗑️</div><div className="text-sm">La papelera está vacía.</div>
            </div>
          ) : (
            papelera.map(reg => (
              <div key={reg.id} className="bg-red-50 rounded-2xl border border-red-200 p-5 opacity-80">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-bold text-slate-700">{reg.equipoNombre}</div>
                    <div className="text-xs text-slate-500 font-mono">{reg.id}</div>
                    <div className="text-xs text-red-600 mt-1">Eliminado por <span className="font-semibold">{reg.deletedBy}</span> el {reg.deletedAt}</div>
                  </div>
                  <button onClick={() => restore(reg.id)} className="btn-hover text-xs bg-white text-brand-700 border border-brand-200 px-3 py-1.5 rounded-lg hover:bg-brand-50 font-semibold">♻️ Restaurar</button>
                </div>
                <p className="text-slate-600 text-sm mt-2">{reg.descripcion}</p>
              </div>
            ))
          )}
        </div>
      )}

      {/* Add modal */}
      {showAdd && (
        <Modal title="Nuevo Registro de Mantenimiento" onClose={() => { resetForm(); setShowAdd(false) }} wide>
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <InputField label="Nombre del Equipo (texto libre)" value={form.equipoNombre} onChange={v => setForm(p => ({ ...p, equipoNombre: v }))} placeholder="Ej: Compresor Atlas Copco GA-22" />
              </div>
              <InputField label="Código del Equipo" value={form.equipoCodigo} onChange={v => setForm(p => ({ ...p, equipoCodigo: v }))} placeholder="Ej: EQ-001" />
              <InputField label="Responsable" value={form.responsable} onChange={v => setForm(p => ({ ...p, responsable: v }))} />
              <InputField label="Fecha de Mantenimiento" value={form.fecha} onChange={v => setForm(p => ({ ...p, fecha: v }))} type="date" />
              <InputField label="Fecha Próximo Mantenimiento" value={form.proximoMant} onChange={v => setForm(p => ({ ...p, proximoMant: v }))} type="date" />
              <div className="col-span-2">
                <label className="text-xs font-medium text-slate-500 mb-1 block">Descripción del trabajo realizado</label>
                <textarea value={form.descripcion} onChange={e => setForm(p => ({ ...p, descripcion: e.target.value }))} rows={3} placeholder="Describe detalladamente el mantenimiento..." className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-brand-400 bg-slate-50 resize-none" />
              </div>
            </div>

            {/* Accessories */}
            <div className="bg-slate-50 rounded-xl p-4">
              <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-3">Accesorios utilizados</div>
              <div className="grid grid-cols-4 gap-2 mb-2">
                <div className="col-span-2"><input value={accForm.nombre} onChange={e => setAccForm(p => ({ ...p, nombre: e.target.value }))} placeholder="Nombre accesorio" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400 bg-white" /></div>
                <div><input value={accForm.codigo} onChange={e => setAccForm(p => ({ ...p, codigo: e.target.value }))} placeholder="Código" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400 bg-white" /></div>
                <div className="flex gap-1">
                  <input type="number" min={1} value={accForm.cantidad} onChange={e => setAccForm(p => ({ ...p, cantidad: e.target.value }))} placeholder="Cant." className="w-14 rounded-xl border border-slate-200 px-2 py-2 text-sm outline-none text-center bg-white" />
                  <button type="button" onClick={addAccesorio} className="btn-hover bg-brand-600 text-white rounded-xl px-3 text-sm font-bold">+</button>
                </div>
              </div>
              {accs.map(a => (
                <div key={a.codigo} className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 mb-1.5 border border-slate-200">
                  <span className="flex-1 text-sm text-slate-700">{a.nombre}</span>
                  <span className="font-mono text-xs text-slate-400">{a.codigo}</span>
                  <span className="bg-brand-100 text-brand-700 text-xs font-bold px-1.5 py-0.5 rounded-md">×{a.cantidad}</span>
                  <button onClick={() => setAccs(prev => prev.filter(x => x.codigo !== a.codigo))} className="text-red-400 hover:text-red-600 text-lg leading-none">×</button>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <InputField label="N° Factura (opcional)" value={form.nroFactura} onChange={v => setForm(p => ({ ...p, nroFactura: v }))} placeholder="000123" />
              <div />
              <ImageUpload label="Foto del trabajo" value={form.imagen} onChange={v => setForm(p => ({ ...p, imagen: v }))} />
              <ImageUpload label="Imagen de Factura" value={form.facturaImg} onChange={v => setForm(p => ({ ...p, facturaImg: v }))} />
            </div>

            <div className="flex gap-3">
              <button onClick={() => { resetForm(); setShowAdd(false) }} className="flex-1 rounded-xl py-2.5 text-sm font-medium text-slate-600 border border-slate-200 hover:bg-slate-50">Cancelar</button>
              <GreenBtn label="Guardar Registro" onClick={saveNew} />
            </div>
          </div>
        </Modal>
      )}

      {/* Edit modal */}
      {editReg && (
        <Modal title="Editar Registro" onClose={() => setEditReg(null)} wide>
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2"><InputField label="Nombre del Equipo" value={editReg.equipoNombre} onChange={v => setEditReg({ ...editReg, equipoNombre: v })} /></div>
              <InputField label="Código del Equipo" value={editReg.equipoCodigo} onChange={v => setEditReg({ ...editReg, equipoCodigo: v })} />
              <InputField label="Responsable" value={editReg.responsable} onChange={v => setEditReg({ ...editReg, responsable: v })} />
              <InputField label="Fecha de Mantenimiento" value={editReg.fecha} onChange={v => setEditReg({ ...editReg, fecha: v })} type="date" />
              <InputField label="Fecha Próximo Mantenimiento" value={editReg.proximoMant} onChange={v => setEditReg({ ...editReg, proximoMant: v })} type="date" />
              <div className="col-span-2">
                <label className="text-xs font-medium text-slate-500 mb-1 block">Descripción</label>
                <textarea value={editReg.descripcion} onChange={e => setEditReg({ ...editReg, descripcion: e.target.value })} rows={3} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-brand-400 bg-slate-50 resize-none" />
              </div>
            </div>
            {/* Accessories in edit */}
            <div className="bg-slate-50 rounded-xl p-4">
              <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-3">Accesorios</div>
              <div className="grid grid-cols-4 gap-2 mb-2">
                <div className="col-span-2"><input value={editAccForm.nombre} onChange={e => setEditAccForm(p => ({ ...p, nombre: e.target.value }))} placeholder="Nombre accesorio" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400 bg-white" /></div>
                <div><input value={editAccForm.codigo} onChange={e => setEditAccForm(p => ({ ...p, codigo: e.target.value }))} placeholder="Código" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400 bg-white" /></div>
                <div className="flex gap-1">
                  <input type="number" min={1} value={editAccForm.cantidad} onChange={e => setEditAccForm(p => ({ ...p, cantidad: e.target.value }))} className="w-14 rounded-xl border border-slate-200 px-2 py-2 text-sm outline-none text-center bg-white" />
                  <button onClick={addEditAcc} className="btn-hover bg-brand-600 text-white rounded-xl px-3 text-sm font-bold">+</button>
                </div>
              </div>
              {editAccs.map(a => (
                <div key={a.codigo} className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 mb-1.5 border border-slate-200">
                  <span className="flex-1 text-sm text-slate-700">{a.nombre}</span>
                  <span className="font-mono text-xs text-slate-400">{a.codigo}</span>
                  <span className="bg-brand-100 text-brand-700 text-xs font-bold px-1.5 py-0.5 rounded-md">×{a.cantidad}</span>
                  <button onClick={() => setEditReg({ ...editReg, accesorios: editReg.accesorios.filter(x => x.codigo !== a.codigo) })} className="text-red-400 hover:text-red-600 text-lg leading-none">×</button>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <InputField label="N° Factura" value={editReg.nroFactura ?? ''} onChange={v => setEditReg({ ...editReg, nroFactura: v })} />
              <div />
              <ImageUpload label="Foto del trabajo" value={editReg.imagen} onChange={v => setEditReg({ ...editReg, imagen: v })} />
              <ImageUpload label="Imagen de Factura" value={editReg.facturaImg} onChange={v => setEditReg({ ...editReg, facturaImg: v })} />
            </div>
            <div className="text-xs bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 text-amber-700">
              ⚠️ Al guardar quedará registrado que <strong>{user.nombre} {user.apellido}</strong> editó este registro el {nowDate()} a las {nowTime()}.
            </div>
            <div className="flex gap-3">
              <button onClick={() => setEditReg(null)} className="flex-1 rounded-xl py-2.5 text-sm font-medium text-slate-600 border border-slate-200">Cancelar</button>
              <GreenBtn label="Guardar Cambios" onClick={saveEdit} />
            </div>
          </div>
        </Modal>
      )}

      {/* Audit view modal */}
      {auditView && (
        <Modal title="Auditoría del Registro" onClose={() => setAuditView(null)}>
          <div className="font-mono text-xs text-slate-400 mb-4">{auditView.id} — {auditView.equipoNombre}</div>
          <div className="flex flex-col gap-3">
            <div className="flex gap-3 items-start">
              <div className="w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 bg-brand-500" />
              <div className="text-xs text-slate-600">
                <span className="font-semibold">{auditView.creadoPor}</span> creó el registro · {auditView.fechaCreacion} {auditView.horaCreacion}
              </div>
            </div>
            {auditView.auditoria.length === 0 && <p className="text-slate-400 text-sm ml-5">Sin ediciones posteriores.</p>}
            {auditView.auditoria.map((a, i) => (
              <div key={i} className="flex gap-3 items-start">
                <div className="w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 bg-amber-400" />
                <div>
                  <div className="text-xs text-slate-600"><span className="font-semibold">{a.usuario}</span> — {a.accion} · {a.fecha} {a.hora}</div>
                  {a.detalle && <div className="text-xs text-slate-500 mt-0.5 bg-slate-50 rounded-lg px-2 py-1 mt-1">{a.detalle}</div>}
                </div>
              </div>
            ))}
          </div>
        </Modal>
      )}
    </div>
  )
}

// ─── Page: Compañeros ─────────────────────────────────────────────────────────

function AvatarEditor({ src, onSave, onClose }: { src: string; onSave: (dataUrl: string) => void; onClose: () => void }) {
  const [scale, setScale] = useState(1)
  const [offsetX, setOffsetX] = useState(0)
  const [offsetY, setOffsetY] = useState(0)
  const [dragging, setDragging] = useState(false)
  const dragStart = useRef<{ mx: number; my: number; ox: number; oy: number } | null>(null)
  const previewRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = (e: React.MouseEvent) => {
    setDragging(true)
    dragStart.current = { mx: e.clientX, my: e.clientY, ox: offsetX, oy: offsetY }
  }
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging || !dragStart.current) return
    setOffsetX(dragStart.current.ox + e.clientX - dragStart.current.mx)
    setOffsetY(dragStart.current.oy + e.clientY - dragStart.current.my)
  }
  const handleMouseUp = () => { setDragging(false); dragStart.current = null }

  const handleSave = () => {
    const size = 300
    const canvas = document.createElement('canvas')
    canvas.width = size; canvas.height = size
    const ctx = canvas.getContext('2d')!
    const img = new Image(); img.src = src
    img.onload = () => {
      ctx.save()
      ctx.beginPath(); ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2); ctx.clip()
      const sw = img.width / scale; const sh = img.height / scale
      const sx = (img.width - sw) / 2 - offsetX * (img.width / (previewRef.current?.offsetWidth ?? size)) / scale
      const sy = (img.height - sh) / 2 - offsetY * (img.height / (previewRef.current?.offsetHeight ?? size)) / scale
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, size, size)
      ctx.restore()
      onSave(canvas.toDataURL('image/jpeg', 0.9))
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6" style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}>
      <div className="bg-white rounded-2xl shadow-2xl flex flex-col gap-5 p-7" style={{ width: 380 }}>
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-800 text-lg" style={{ fontFamily: 'Outfit,sans-serif' }}>Ajustar foto de perfil</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 text-xl w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-100">×</button>
        </div>
        {/* Preview area */}
        <div className="flex justify-center">
          <div
            ref={previewRef}
            className="rounded-full overflow-hidden flex-shrink-0 select-none"
            style={{ width: 220, height: 220, cursor: dragging ? 'grabbing' : 'grab', border: '3px solid #3dab76', position: 'relative' }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <img
              src={src}
              draggable={false}
              style={{ width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${scale}) translate(${offsetX / scale}px,${offsetY / scale}px)`, transformOrigin: 'center', userSelect: 'none', pointerEvents: 'none' }}
              alt=""
            />
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-xs text-slate-500 mb-1">
            <span>Zoom</span><span>{Math.round(scale * 100)}%</span>
          </div>
          <input type="range" min={50} max={300} value={Math.round(scale * 100)} onChange={e => setScale(Number(e.target.value) / 100)} className="w-full accent-brand-600" />
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-xs text-slate-500 mb-1">
            <span>Posición horizontal</span>
          </div>
          <input type="range" min={-150} max={150} value={offsetX} onChange={e => setOffsetX(Number(e.target.value))} className="w-full accent-brand-600" />
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-xs text-slate-500 mb-1">
            <span>Posición vertical</span>
          </div>
          <input type="range" min={-150} max={150} value={offsetY} onChange={e => setOffsetY(Number(e.target.value))} className="w-full accent-brand-600" />
        </div>
        <p className="text-slate-400 text-xs text-center">Arrastra la imagen para posicionarla o usa los controles</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 rounded-xl py-2.5 text-sm font-medium text-slate-600 border border-slate-200 hover:bg-slate-50">Cancelar</button>
          <button onClick={handleSave} className="flex-1 rounded-xl py-2.5 text-sm font-semibold text-white" style={{ background: 'linear-gradient(135deg,#2a8a5e,#1e6b4a)' }}>Guardar foto</button>
        </div>
      </div>
    </div>,
    document.body
  )
}

function EmergencyContactEditor({ user, onSave }: { user: SysUser; onSave: (u: SysUser) => void }) {
  const [editing, setEditing] = useState(false)
  const [nombre, setNombre] = useState(user.contactoEmergencia?.nombre ?? '')
  const [telefono, setTelefono] = useState(user.contactoEmergencia?.telefono ?? '')
  if (!editing) return (
    <button type="button" onClick={() => setEditing(true)} className="mt-1 text-[10px] text-orange-500 hover:text-orange-700 font-semibold underline">
      {user.contactoEmergencia?.nombre ? 'Editar' : '+ Agregar'}
    </button>
  )
  return (
    <div className="flex flex-col gap-1 mt-1.5">
      <input value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Nombre del contacto" className="rounded-lg border border-orange-200 px-2 py-1 text-xs outline-none focus:border-orange-400 bg-white" />
      <input value={telefono} onChange={e => setTelefono(e.target.value)} placeholder="+56 9 XXXX XXXX" className="rounded-lg border border-orange-200 px-2 py-1 text-xs outline-none focus:border-orange-400 bg-white" />
      <div className="flex gap-1">
        <button type="button" onClick={() => { onSave({ ...user, contactoEmergencia: { nombre, telefono } }); setEditing(false) }} className="text-[10px] bg-orange-500 text-white px-2 py-0.5 rounded-lg font-semibold">Guardar</button>
        <button type="button" onClick={() => setEditing(false)} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-lg">Cancelar</button>
      </div>
    </div>
  )
}

function PageCompaneros({ users, currentUserId, lastSeen, onUpdateUser }: { users: SysUser[]; currentUserId: number; lastSeen: Record<number, string>; onUpdateUser: (u: SysUser) => void }) {
  const [busqueda, setBusqueda] = useState('')
  const [filtroDpto, setFiltroDpto] = useState('Todos')
  const deptos = ['Todos', ...Array.from(new Set(users.map(u => u.departamento)))]
  const filtrados = users.filter(u => {
    const q = busqueda.toLowerCase()
    return (filtroDpto === 'Todos' || u.departamento === filtroDpto) && (!q || `${u.nombre} ${u.apellido}`.toLowerCase().includes(q) || u.rol.toLowerCase().includes(q))
  })
  const proxCumples = users.filter(u => isProximoCumple(u.cumpleanos))

  return (
    <div className="p-8 max-w-5xl mx-auto w-full page-enter">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800" style={{ fontFamily: 'Outfit,sans-serif' }}>👥 Compañeros</h1>
        <p className="text-slate-500 text-sm mt-0.5">Directorio del equipo — {users.filter(u => u.activo).length} activos</p>
      </div>
      {proxCumples.length > 0 && (
        <div className="rounded-2xl p-4 flex items-center gap-4 mb-6 text-white card-hover" style={{ background: 'linear-gradient(135deg,#154d38,#2a8a5e)' }}>
          <span className="text-2xl">🎂</span>
          <div>
            <div className="font-semibold text-sm">Próximos cumpleaños (15 días)</div>
            <div className="text-white/70 text-xs">{proxCumples.map(u => `${u.nombre} ${u.apellido} — ${u.cumpleanos}`).join(' · ')}</div>
          </div>
        </div>
      )}
      <div className="flex gap-3 flex-wrap items-center mb-6">
        <input type="text" placeholder="Buscar nombre o rol..." value={busqueda} onChange={e => setBusqueda(e.target.value)} className="flex-1 min-w-48 rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand-400 bg-white" />
        {deptos.map(d => (
          <button key={d} onClick={() => setFiltroDpto(d)} className={`btn-hover px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${filtroDpto === d ? 'border-brand-600 bg-brand-600 text-white' : 'border-slate-200 bg-white text-slate-600 hover:border-brand-400'}`}>{d}</button>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtrados.map(u => {
          const isOnline = u.id === currentUserId
          const seen = lastSeen[u.id]
          const isMe = u.id === currentUserId
          return (
            <div key={u.id} className={`bg-white rounded-2xl p-5 border shadow-sm card-hover ${!u.activo ? 'opacity-60' : isOnline ? 'border-brand-300' : 'border-slate-100'}`}>
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold text-white flex-shrink-0 overflow-hidden" style={{ background: u.activo ? 'linear-gradient(135deg,#3dab76,#154d38)' : '#94a3b8' }}>
                  {u.foto ? <img src={u.foto} className="w-full h-full object-cover" alt="" /> : u.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="font-semibold text-slate-800">{u.nombre} {u.apellido}</div>
                    {isOnline ? (
                      <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-200">
                        <PulseDot color="green" /> En línea
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400">{seen ? relativeTime(seen) : 'Sin registro'}</span>
                    )}
                  </div>
                  <div className="text-brand-600 text-sm font-medium">{u.rol}</div>
                  <div className="text-slate-400 text-xs">{u.departamento}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[['🎂', 'Cumpleaños', u.cumpleanos], ['📞', 'Teléfono', u.telefono]].map(([icon, lbl, val]) => (
                  <div key={lbl} className="bg-slate-50 rounded-xl px-3 py-2">
                    <div className="text-slate-400 text-[10px] uppercase tracking-wider">{icon} {lbl}</div>
                    <div className="text-slate-700 text-xs font-medium mt-0.5">{val}</div>
                  </div>
                ))}
                <div className="bg-slate-50 rounded-xl px-3 py-2 col-span-2">
                  <div className="text-slate-400 text-[10px] uppercase tracking-wider">✉️ Email</div>
                  <div className="text-slate-700 text-xs font-medium mt-0.5 truncate">{u.email}</div>
                </div>
                <div className="bg-orange-50 rounded-xl px-3 py-2 col-span-2 border border-orange-100">
                  <div className="text-orange-400 text-[10px] uppercase tracking-wider mb-1">🚨 Contacto de Emergencia</div>
                  {u.contactoEmergencia?.nombre ? (
                    <div>
                      <div className="text-slate-700 text-xs font-semibold">{u.contactoEmergencia.nombre}</div>
                      <div className="text-slate-500 text-xs">{u.contactoEmergencia.telefono}</div>
                    </div>
                  ) : (
                    <div className="text-slate-400 text-xs italic">No registrado</div>
                  )}
                  {isMe && <EmergencyContactEditor user={u} onSave={onUpdateUser} />}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Persistent state hook ────────────────────────────────────────────────────

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [currentUser, setCurrentUser] = useState<SysUser | null>(null)
  const [page, setPage] = useState<Page>('inicio')
  const [darkMode, setDarkMode] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const { message: bannerMsg, visible: bannerVisible } = useRotatingMessage()
  useEffect(() => { document.documentElement.classList.toggle('dark-mode', darkMode) }, [darkMode])

  // ── Data state — loaded from D1 via API ──
  const [users, setUsers] = useState<SysUser[]>([])
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [registros, setRegistros] = useState<MantRegistro[]>([])
  const [noticias, setNoticias] = useState<Noticia[]>([])
  const [sugerencias, setSugerencias] = useState<Sugerencia[]>([])
  const [lastSeen, setLastSeen] = useState<Record<number, string>>({})
  const [loading, setLoading] = useState(false)

  // Load all data after login
  const loadAll = useCallback(async () => {
    setLoading(true)
    try {
      const [u, p, r, n, s] = await Promise.all([
        api.getUsers(),
        api.getPedidos(),
        api.getMantenimientos(),
        api.getNoticias(),
        api.getSugerencias(),
      ])
      setUsers(u)
      setPedidos(p)
      setRegistros(r)
      setNoticias(n)
      setSugerencias(s)
    } catch (e) {
      console.error('Error cargando datos:', e)
    } finally {
      setLoading(false)
    }
  }, [])

  const handleLogin = async (u: SysUser) => {
    const now = new Date().toISOString()
    setLastSeen(prev => ({ ...prev, [u.id]: now }))
    setCurrentUser(u)
    setPage('inicio')
    await loadAll()
  }

  const handleLogout = async () => {
    await api.logout()
    setCurrentUser(null)
    setUsers([]); setPedidos([]); setRegistros([]); setNoticias([]); setSugerencias([])
  }

  // Wrap setters so pages can optimistically update + push to API
  const setPedidosWithApi: React.Dispatch<React.SetStateAction<Pedido[]>> = useCallback((action) => {
    setPedidos(prev => {
      const next = typeof action === 'function' ? action(prev) : action
      // Find changed/new pedido and sync
      const changed = next.find(p => {
        const old = prev.find(o => o.id === p.id)
        return !old || JSON.stringify(old) !== JSON.stringify(p)
      })
      if (changed) {
        const isNew = !prev.find(o => o.id === changed.id)
        if (isNew) api.createPedido(changed).catch(console.error)
        else api.updatePedido(changed).catch(console.error)
      }
      return next
    })
  }, [])

  const setRegistrosWithApi: React.Dispatch<React.SetStateAction<MantRegistro[]>> = useCallback((action) => {
    setRegistros(prev => {
      const next = typeof action === 'function' ? action(prev) : action
      const changed = next.find(m => {
        const old = prev.find(o => o.id === m.id)
        return !old || JSON.stringify(old) !== JSON.stringify(m)
      })
      if (changed) {
        const isNew = !prev.find(o => o.id === changed.id)
        if (isNew) api.createMantenimiento(changed).catch(console.error)
        else api.updateMantenimiento(changed).catch(console.error)
      }
      return next
    })
  }, [])

  const setNoticiasWithApi: React.Dispatch<React.SetStateAction<Noticia[]>> = useCallback((action) => {
    setNoticias(prev => {
      const next = typeof action === 'function' ? action(prev) : action
      const added = next.find(n => !prev.find(o => o.id === n.id))
      const removed = prev.find(n => !next.find(o => o.id === n.id))
      if (added) api.createNoticia(added).then(saved => {
        setNoticias(p => p.map(n => n === added ? saved : n))
      }).catch(console.error)
      if (removed) api.deleteNoticia(removed.id).catch(console.error)
      return next
    })
  }, [])

  const setSugerenciasWithApi: React.Dispatch<React.SetStateAction<Sugerencia[]>> = useCallback((action) => {
    setSugerencias(prev => {
      const next = typeof action === 'function' ? action(prev) : action
      const added = next.find(s => !prev.find(o => o.id === s.id))
      const removed = prev.find(s => !next.find(o => o.id === s.id))
      const changed = next.find(s => {
        const old = prev.find(o => o.id === s.id)
        return old && old.estado !== s.estado
      })
      if (added) api.createSugerencia(added).then(saved => {
        setSugerencias(p => p.map(s => s === added ? saved : s))
      }).catch(console.error)
      if (removed) api.deleteSugerencia(removed.id).catch(console.error)
      if (changed) api.updateSugerencia(changed).catch(console.error)
      return next
    })
  }, [])

  const setUsersWithApi: React.Dispatch<React.SetStateAction<SysUser[]>> = useCallback((action) => {
    setUsers(prev => {
      const next = typeof action === 'function' ? action(prev) : action
      const added = next.find(u => !prev.find(o => o.id === u.id))
      const removed = prev.find(u => !next.find(o => o.id === u.id))
      const changed = next.find(u => {
        const old = prev.find(o => o.id === u.id)
        return old && JSON.stringify(old) !== JSON.stringify(u)
      })
      if (added) api.createUser(added).then(saved => {
        setUsers(p => p.map(u => u === added ? saved : u))
      }).catch(console.error)
      if (removed) api.deleteUser(removed.id).catch(console.error)
      if (changed) api.updateUser(changed).catch(console.error)
      return next
    })
  }, [])

  const updateUser = useCallback((u: SysUser) => {
    setCurrentUser(u)
    setUsers(prev => prev.map(x => x.id === u.id ? u : x))
    api.updateUser(u).catch(console.error)
  }, [])

  // Auto-login from stored token
  useEffect(() => {
    const token = api.loadToken()
    if (!token) return
    // Validate token by loading data — if 401 it will throw
    loadAll().catch(() => api.logout())
  }, [loadAll])

  if (loading && !currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a1a10' }}>
        <div className="text-white text-lg font-semibold" style={{ fontFamily: 'Outfit,sans-serif' }}>⏳ Cargando...</div>
      </div>
    )
  }

  if (!currentUser) return <LoginPage onLogin={handleLogin} users={users} noticias={noticias} />

  const isAdmin = currentUser.permisos.includes('admin')
  const visiblePedidos = isAdmin ? pedidos : pedidos.filter(p => p.userId === currentUser.id || !p.userId)
  const visibleRegistros = isAdmin ? registros : registros.filter(r => r.userId === currentUser.id || !r.userId)

  return (
    <div className="flex flex-col min-h-screen bg-slate-100">
      {/* Banner full-width — de lado a lado, encima de todo */}
      <div className="w-full flex-shrink-0 z-30 sticky top-0" style={{ background: 'linear-gradient(90deg,#0f3325,#1e6b4a,#0f3325)' }}>
        <div className="flex items-center gap-2 px-4 py-2">
          <span className="text-sm flex-shrink-0">🌿</span>
          <p className="flex-1 text-white text-xs font-medium leading-snug transition-opacity duration-400 text-center truncate" style={{ opacity: bannerVisible ? 1 : 0 }}>{bannerMsg}</p>
          <button
            onClick={() => setDarkMode(d => !d)}
            title={darkMode ? 'Modo claro' : 'Modo oscuro'}
            className="flex-shrink-0 flex items-center justify-center rounded-md transition-all"
            style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', width: 30, height: 24, fontSize: 13 }}
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
        </div>
      </div>
      {/* Sidebar + contenido debajo del banner */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar page={page} onNav={setPage} user={currentUser} onLogout={handleLogout} collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(p => !p)} />
        <main className="flex-1 overflow-auto">
          <div key={page} className="page-enter">
            {page === 'inicio' && <PageInicio user={currentUser} pedidos={visiblePedidos} registros={visibleRegistros} noticias={noticias} onNav={setPage} onUpdateUser={updateUser} />}
            {page === 'informacion' && <PageInformacion user={currentUser} noticias={noticias} setNoticias={setNoticiasWithApi} sugerencias={sugerencias} setSugerencias={setSugerenciasWithApi} />}
            {page === 'pedidos' && <PagePedidos user={currentUser} pedidos={visiblePedidos} setPedidos={setPedidosWithApi} allPedidos={pedidos} />}
            {page === 'mantenimientos' && <PageMantenimientos user={currentUser} registros={visibleRegistros} setRegistros={setRegistrosWithApi} />}
            {page === 'companeros' && <PageCompaneros users={users} currentUserId={currentUser.id} lastSeen={lastSeen} onUpdateUser={updateUser} />}
            {page === 'admin' && isAdmin && <PageAdmin users={users} setUsers={setUsersWithApi} currentUser={currentUser} />}
          </div>
        </main>
      </div>
    </div>
  )
}
