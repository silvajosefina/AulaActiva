
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import styles from './MisCursos.module.css'
import { ROUTES } from '../../constants/routes'
import {
  obtenerCursosAlumno,
  obtenerAsistenciasAlumno,
  type CursoAlumno,
  type AsistenciaAlumno,
  type EstadoAsistenciaAlumno,
} from '../../services/alumno'

const diasOrden = [
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
  'Domingo',
]

function formatearFecha(fecha: string) {
  const [anio, mes, dia] = fecha.split('-')
  return `${dia}/${mes}/${anio}`
}

function obtenerNombreMes(mes: string) {
  const nombres = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
  ]

  return nombres[Number(mes) - 1] ?? mes
}

function obtenerNombreEstado(estado: EstadoAsistenciaAlumno) {
  const nombres: Record<EstadoAsistenciaAlumno, string> = {
    PRESENTE: 'Presente',
    TARDANZA: 'Tardanza',
    AUSENTE: 'Ausente',
    JUSTIFICADA: 'Justificada',
    SUSPENDIDA: 'Suspendida',
  }

  return nombres[estado]
}

function MisCursos() {
  const [cursos, setCursos] = useState<CursoAlumno[]>([])
  const [asistencias, setAsistencias] = useState<AsistenciaAlumno[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(false)

  const [cursoAbierto, setCursoAbierto] = useState<number | null>(null)
  const [periodo, setPeriodo] = useState('TODOS')

  // Consultamos los cursos y las asistencias del alumno autenticado.
  useEffect(() => {
    let activo = true

    async function cargarDatos() {
      try {
        const [cursosRecibidos, asistenciasRecibidas] = await Promise.all([
          obtenerCursosAlumno(),
          obtenerAsistenciasAlumno(),
        ])

        if (activo) {
          setCursos(cursosRecibidos)
          setAsistencias(asistenciasRecibidas)
        }
      } catch (err) {
        console.error('Error al cargar los cursos del alumno:', err)

        if (activo) {
          setError(true)
        }
      } finally {
        if (activo) {
          setCargando(false)
        }
      }
    }

    cargarDatos()

    return () => {
      activo = false
    }
  }, [])

  // Generamos los meses disponibles a partir de las asistencias reales.
  const periodosDisponibles = useMemo(() => {
    return [...new Set(
      asistencias.map((asistencia) => asistencia.fecha.slice(0, 7)),
    )].sort((a, b) => b.localeCompare(a))
  }, [asistencias])

  // Relacionamos cada curso con sus propias asistencias mediante idCurso.
  const cursosFiltrados = useMemo(() => {
    return cursos.map((curso) => {
      const clasesDelCurso = asistencias.filter(
        (asistencia) => asistencia.idCurso === curso.idCurso,
      )

      const clasesFiltradas =
        periodo === 'TODOS'
          ? clasesDelCurso
          : clasesDelCurso.filter(
              (clase) => clase.fecha.startsWith(periodo),
            )

      const clasesComputables = clasesFiltradas.filter(
        (clase) =>
          clase.estado !== 'SUSPENDIDA' &&
          clase.estado !== 'JUSTIFICADA',
      )

      const presentes = clasesComputables.filter(
        (clase) => clase.estado === 'PRESENTE',
      ).length

      const tardanzas = clasesComputables.filter(
        (clase) => clase.estado === 'TARDANZA',
      ).length

      const ausentes = clasesComputables.filter(
        (clase) => clase.estado === 'AUSENTE',
      ).length

      const justificadas = clasesFiltradas.filter(
        (clase) => clase.estado === 'JUSTIFICADA',
      ).length

      const suspendidas = clasesFiltradas.filter(
        (clase) => clase.estado === 'SUSPENDIDA',
      ).length

      const total = clasesComputables.length

      const porcentaje =
        total > 0
          ? Math.round(((presentes + tardanzas) / total) * 100)
          : null

      return {
        ...curso,
        clasesFiltradas,
        presentes,
        tardanzas,
        ausentes,
        justificadas,
        suspendidas,
        total,
        porcentaje,
      }
    })
  }, [cursos, asistencias, periodo])

  const nombrePeriodo =
    periodo === 'TODOS'
      ? 'Todos los períodos'
      : `${obtenerNombreMes(periodo.slice(5))} ${periodo.slice(0, 4)}`

  return (
    <main className={styles.contenedor}>
      <header className={styles.encabezado}>
        <div>
          <p className={styles.etiqueta}>AULA ACTIVA</p>
          <h1>Mis cursos</h1>
          <p className={styles.subtitulo}>
            Consultá tus materias, horarios y seguimiento de asistencia.
          </p>
        </div>

        <Link to={ROUTES.ALUMNO} className={styles.botonVolver}>
          ← Volver al panel
        </Link>
      </header>

      {cargando ? (
        <p className={styles.mensajeEstado}>
          Cargando tus cursos y asistencias...
        </p>
      ) : error ? (
        <p className={styles.mensajeError} role="alert">
          No pudimos cargar tus cursos. Verificá tu conexión e intentá
          nuevamente más tarde.
        </p>
      ) : cursos.length === 0 ? (
        <p className={styles.sinCursos}>
          Todavía no tenés cursos asignados.
        </p>
      ) : (
        <>
          <section className={styles.seccionFiltro}>
            <div>
              <h2>Mis materias</h2>
              <p>Seleccioná un curso para consultar sus detalles.</p>
            </div>

            <label className={styles.filtro}>
              <span>Período:</span>
              <select
                value={periodo}
                onChange={(event) => setPeriodo(event.target.value)}
              >
                <option value="TODOS">Todos los períodos</option>

                {periodosDisponibles.map((mes) => (
                  <option key={mes} value={mes}>
                    {obtenerNombreMes(mes.slice(5))} {mes.slice(0, 4)}
                  </option>
                ))}
              </select>
            </label>
          </section>

          <p className={styles.textoPeriodo}>
            Mostrando información de: <strong>{nombrePeriodo}</strong>
          </p>

          <section className={styles.listaMaterias}>
            {cursosFiltrados.map((curso) => {
              const estaAbierta = cursoAbierto === curso.idCurso

              const clasePorcentaje =
                curso.porcentaje === null
                  ? ''
                  : curso.porcentaje < 60
                    ? styles.porcentajeRojo
                    : curso.porcentaje < 80
                      ? styles.porcentajeAmarillo
                      : styles.porcentajeVerde

              return (
                <article
                  className={styles.tarjetaMateria}
                  key={curso.idCurso}
                >
                  <button
                    type="button"
                    className={styles.cabeceraTarjeta}
                    onClick={() =>
                      setCursoAbierto(
                        estaAbierta ? null : curso.idCurso,
                      )
                    }
                    aria-expanded={estaAbierta}
                  >
                    <div className={styles.infoMateria}>
                      <span className={styles.iconoMateria}>▣</span>

                      <div>
                        <h3>{curso.materia.nombre}</h3>
                        <p>
                          {curso.anio}° Año · Comisión {curso.comision}
                        </p>
                        <p className={styles.nombreDocente}>
                          {curso.docentes.length > 0
                            ? curso.docentes.join(', ')
                            : 'Docente no asignado'}
                        </p>
                        <p>{curso.periodo}</p>
                      </div>
                    </div>

                    <div className={styles.resumenMateria}>
                      <span className={`${styles.porcentaje} ${clasePorcentaje}`}>
                        {curso.porcentaje === null
                          ? 'Sin datos'
                          : `${curso.porcentaje}%`}
                      </span>
                      <span className={styles.textoAsistencia}>
                        Asistencia
                      </span>
                      <span className={styles.flecha}>
                        {estaAbierta ? '⌃' : '⌄'}
                      </span>
                    </div>
                  </button>

                  {estaAbierta && (
                    <div className={styles.detalleMateria}>
                      <div className={styles.bloqueHorarios}>
                        <h4>Horarios de cursada</h4>

                        {curso.horarios.length === 0 ? (
                          <p className={styles.sinClases}>
                            No hay horarios registrados.
                          </p>
                        ) : (
                          <div className={styles.listaHorarios}>
                            {[...curso.horarios]
                              .sort((a, b) => {
                                const diferencia =
                                  diasOrden.indexOf(a.dia) -
                                  diasOrden.indexOf(b.dia)

                                return diferencia ||
                                  a.inicio.localeCompare(b.inicio)
                              })
                              .map((horario, indice) => (
                                <div
                                  className={styles.horario}
                                  key={`${horario.dia}-${horario.inicio}-${indice}`}
                                >
                                  <span>{horario.dia}</span>
                                  <strong>
                                    {horario.inicio} a {horario.fin} hs
                                  </strong>
                                </div>
                              ))}
                          </div>
                        )}
                      </div>

                      <div className={styles.bloqueEstadisticas}>
                        <h4>Resumen de asistencia</h4>

                        <div className={styles.estadisticas}>
                          <div className={styles.estadistica}>
                            <strong>{curso.presentes}</strong>
                            <span>Presentes</span>
                          </div>

                          <div className={styles.estadistica}>
                            <strong>{curso.tardanzas}</strong>
                            <span>Tardanzas</span>
                          </div>

                          <div className={styles.estadistica}>
                            <strong>{curso.ausentes}</strong>
                            <span>Ausentes</span>
                          </div>

                          <div className={styles.estadistica}>
                            <strong>{curso.justificadas}</strong>
                            <span>Justificadas</span>
                          </div>

                          <div className={styles.estadistica}>
                            <strong>{curso.total}</strong>
                            <span>Clases computadas</span>
                          </div>
                        </div>

                        <p className={styles.aclaracion}>
                          Las tardanzas cuentan como asistencia. Las
                          ausencias justificadas y las clases suspendidas
                          no se incluyen en el cálculo del porcentaje.
                        </p>
                      </div>

                      <div className={styles.bloqueClases}>
                        <h4>Registro de clases</h4>

                        {curso.clasesFiltradas.length === 0 ? (
                          <p className={styles.sinClases}>
                            No hay clases registradas para este período.
                          </p>
                        ) : (
                          <div className={styles.listaClases}>
                            {[...curso.clasesFiltradas]
                              .sort((a, b) =>
                                a.fecha.localeCompare(b.fecha) ||
                                a.idAsistencia - b.idAsistencia,
                              )
                              .map((clase) => (
                                <div
                                  className={styles.filaClase}
                                  key={clase.idAsistencia}
                                >
                                  <span>{formatearFecha(clase.fecha)}</span>

                                  <span
                                    className={`${styles.estado} ${
                                      styles[clase.estado.toLowerCase()]
                                    }`}
                                  >
                                    {obtenerNombreEstado(clase.estado)}
                                  </span>
                                </div>
                              ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </article>
              )
            })}
          </section>
        </>
      )}
    </main>
  )
}

export default MisCursos
