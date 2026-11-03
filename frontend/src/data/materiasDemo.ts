
export type EstadoAsistencia =
  | 'PRESENTE'
  | 'TARDANZA'
  | 'AUSENTE'
  | 'JUSTIFICADA'
  | 'SUSPENDIDA'

export interface Clase {
  fecha: string
  estado: EstadoAsistencia
}

export interface Horario {
  dia: string
  inicio: string
  fin: string
}

export interface Materia {
  id: number
  nombre: string
  comision: string
  docente: string
  horarios: Horario[]
  clases: Clase[]
}

export const materiasDemo: Materia[] = [
  {
    id: 1,
    nombre: 'Bases de Datos',
    comision: '2° Año - Comisión A',
    docente: 'Prof. Martín Gómez',
    horarios: [
      { dia: 'Lunes', inicio: '18:00', fin: '20:00' },
      { dia: 'Miércoles', inicio: '18:00', fin: '20:00' },
    ],
    clases: [
      { fecha: '2026-10-01', estado: 'PRESENTE' },
      { fecha: '2026-10-06', estado: 'PRESENTE' },
      { fecha: '2026-10-08', estado: 'PRESENTE' },
      { fecha: '2026-10-13', estado: 'PRESENTE' },
      { fecha: '2026-10-14', estado: 'JUSTIFICADA' },
      { fecha: '2026-10-15', estado: 'TARDANZA' },
      { fecha: '2026-10-20', estado: 'PRESENTE' },
      { fecha: '2026-10-22', estado: 'AUSENTE' },
      { fecha: '2026-10-27', estado: 'PRESENTE' },
      { fecha: '2026-10-29', estado: 'SUSPENDIDA' },
      { fecha: '2026-11-03', estado: 'PRESENTE' },
    ],
  },
  {
    id: 2,
    nombre: 'Programación II',
    comision: '2° Año - Comisión A',
    docente: 'Prof. Laura Fernández',
    horarios: [
      { dia: 'Martes', inicio: '18:00', fin: '20:00' },
      { dia: 'Jueves', inicio: '18:00', fin: '20:00' },
    ],
    clases: [
      { fecha: '2026-10-05', estado: 'PRESENTE' },
      { fecha: '2026-10-07', estado: 'PRESENTE' },
      { fecha: '2026-10-12', estado: 'PRESENTE' },
      { fecha: '2026-10-14', estado: 'PRESENTE' },
      { fecha: '2026-10-19', estado: 'TARDANZA' },
      { fecha: '2026-10-21', estado: 'PRESENTE' },
      { fecha: '2026-10-26', estado: 'AUSENTE' },
      { fecha: '2026-10-28', estado: 'PRESENTE' },
    ],
  },
  {
    id: 3,
    nombre: 'Probabilidad y Estadística',
    comision: '2° Año - Comisión A',
    docente: 'Prof. Ricardo Rinaldi',
    horarios: [
      { dia: 'Viernes', inicio: '18:00', fin: '21:00' },
    ],
    clases: [
      { fecha: '2026-10-02', estado: 'PRESENTE' },
      { fecha: '2026-10-09', estado: 'TARDANZA' },
      { fecha: '2026-10-16', estado: 'AUSENTE' },
      { fecha: '2026-10-23', estado: 'PRESENTE' },
      { fecha: '2026-10-30', estado: 'PRESENTE' },
    ],
  },
]
