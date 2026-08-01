export type Page = 'inicio' | 'informacion' | 'pedidos' | 'mantenimientos' | 'companeros' | 'admin'
export type PedidoEstado = 'ingresado' | 'en_proceso' | 'en_inspeccion' | 'terminado'

export interface AuditEntry { usuario: string; accion: string; fecha: string; hora: string; detalle?: string }

export interface SysUser {
  id: number; nombre: string; apellido: string; usuario: string; password: string
  rol: string; departamento: string; email: string; telefono: string
  fechaIngreso: string; cumpleanos: string; avatar: string; permisos: Page[]; activo: boolean
  foto?: string; canPublish?: boolean; canDeleteBitacora?: boolean
  contactoEmergencia?: { nombre: string; telefono: string }
}

export interface Note { id: number; text: string; done: boolean; at: string; dueDate?: string }

export interface PedidoLog {
  id: number; fecha: string; hora: string
  tipo: 'estado' | 'falla' | 'atraso' | 'nota' | 'creacion'
  descripcion: string; usuario: string; imagen?: string
}

export interface Pedido {
  id: string; empresa: string; oc: string; material: string; pesoUnitKg: number
  cantidad: number; totalKg: number; fechaInicio: string; fechaFin: string
  estado: PedidoEstado; solicitante: string; fechaCreacion: string
  bitacora: PedidoLog[]; auditoria: AuditEntry[]
  deleted?: boolean; deletedBy?: string; deletedAt?: string
  userId?: number
}

export interface MantAccesorio { nombre: string; codigo: string; cantidad: number }

export interface MantRegistro {
  id: string; equipoNombre: string; equipoCodigo: string
  fecha: string; proximoMant: string; descripcion: string
  accesorios: MantAccesorio[]; responsable: string
  imagen?: string; nroFactura?: string; facturaImg?: string
  creadoPor: string; fechaCreacion: string; horaCreacion: string
  auditoria: AuditEntry[]
  deleted?: boolean; deletedBy?: string; deletedAt?: string
  userId?: number
}

export interface Noticia {
  id: number; titulo: string; cuerpo: string; autor: string; rol: string; fecha: string; createdAt?: string
  tipo: 'comunicado' | 'operacional' | 'seguridad' | 'admin'; imagen?: string
}

export interface Sugerencia { id: number; texto: string; autor: string; fecha: string; estado: 'pendiente' | 'revisada'; createdAt?: string }
