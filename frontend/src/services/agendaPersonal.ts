
import { api } from './api'

export type TipoEventoPersonal =
  | 'Parcial'
  | 'Final'
  | 'Entrega de TP'
  | 'Reunión'
  | 'Recordatorio'
  | 'Otro'

export interface EventoPersonal {
  id: string
  titulo: string
  tipo: TipoEventoPersonal
  fecha: string
  horaInicio?: string
  horaFin?: string
  idCurso?: number
  notas?: string

  // Se conserva para compatibilidad con registros anteriores.
  materiaId?: number
}

export interface EventoPersonalInput {
  titulo: string
  tipo: TipoEventoPersonal
  fecha: string
  horaInicio?: string
  horaFin?: string
  idCurso?: number
  notas?: string
}

// Consulta todos los eventos del alumno autenticado.
export async function obtenerEventosPersonales(): Promise<EventoPersonal[]> {
  const respuesta = await api.get<{ eventos: EventoPersonal[] }>(
    '/alumno/agenda-personal',
  )

  return respuesta.data.eventos
}

// Crea un nuevo evento personal.
export async function crearEventoPersonal(
  evento: EventoPersonalInput,
): Promise<EventoPersonal> {
  const respuesta = await api.post<{ evento: EventoPersonal }>(
    '/alumno/agenda-personal',
    evento,
  )

  return respuesta.data.evento
}

// Actualiza un evento existente.
export async function actualizarEventoPersonal(
  id: string,
  evento: EventoPersonalInput,
): Promise<EventoPersonal> {
  const respuesta = await api.put<{ evento: EventoPersonal }>(
    `/alumno/agenda-personal/${id}`,
    evento,
  )

  return respuesta.data.evento
}

// Elimina un evento existente.
export async function eliminarEventoPersonal(
  id: string,
): Promise<void> {
  await api.delete(`/alumno/agenda-personal/${id}`)
}
