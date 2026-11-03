
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import styles from './MisCursos.module.css'
import { ROUTES } from '../../constants/routes'
import {
  materiasDemo,
  type Materia,
  type EstadoAsistencia,
} from '../../data/materiasDemo'

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

  return nombres[Number(mes) - 1]
}

function obtenerNombreEstado(estado: EstadoAsistencia) {
  const nombres: Record<EstadoAsistencia, string> = {
    PRESENTE: 'Presente',
    TARDANZA: 'Tardanza',
    AUSENTE: 'Ausente',
    JUSTIFICADA: 'Justificada',
    SUSPENDIDA: 'Suspendida',
  }

  return nombres[estado]
}

function MisCursos() {
  const [materiaAbierta, setMateriaAbierta] = useState<number | null>(null)
  const [periodo, setPeriodo] = useState('TODOS')

  const materiasFiltradas = useMemo(() => {
    return materiasDemo.map((materia: Materia) => {
      const clasesFiltradas =
        periodo === 'TODOS'
          ? materia.clases
          : materia.clases.filter((clase) => clase.fecha.startsWith(periodo))

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
        ...materia,
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
  }, [periodo])

  const nombrePeriodo =
    periodo === 'TODOS'
      ? 'Todo el período'
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

      <section className={styles.seccionFiltro}>
        <div>
          <h2>Mis materias</h2>
          <p>Seleccioná una materia para consultar sus detalles.</p>
        </div>

        <label className={styles.filtro}>
          <span>Período:</span>
          <select
            value={periodo}
            onChange={(event) => setPeriodo(event.target.value)}
          >
            <option value="TODOS">Todo el período</option>
            <option value="2026-10">Octubre 2026</option>
            <option value="2026-11">Noviembre 2026</option>
          </select>
        </label>
      </section>

      <p className={styles.textoPeriodo}>
        Mostrando información de: <strong>{nombrePeriodo}</strong>
      </p>

      <section className={styles.listaMaterias}>
        {materiasFiltradas.map((materia) => {
          const estaAbierta = materiaAbierta === materia.id

          return (
            <article className={styles.tarjetaMateria} key={materia.id}>
              <button
                type="button"
                className={styles.cabeceraTarjeta}
                onClick={() =>
                  setMateriaAbierta(estaAbierta ? null : materia.id)
                }
                aria-expanded={estaAbierta}
              >
                <div className={styles.infoMateria}>
                  <span className={styles.iconoMateria}>▣</span>

                  <div>
                    <h3>{materia.nombre}</h3>
                    <p>{materia.comision}</p>
                    <p className={styles.nombreDocente}>{materia.docente}</p>
                  </div>
                </div>

                <div className={styles.resumenMateria}>
                  <span className={styles.porcentaje}>
                    {materia.porcentaje === null
                      ? 'Sin datos'
                      : `${materia.porcentaje}%`}
                  </span>
                  <span className={styles.textoAsistencia}>Asistencia</span>
                  <span className={styles.flecha}>
                    {estaAbierta ? '⌃' : '⌄'}
                  </span>
                </div>
              </button>

              {estaAbierta && (
                <div className={styles.detalleMateria}>
                  <div className={styles.bloqueHorarios}>
                    <h4>Horarios de cursada</h4>

                    <div className={styles.listaHorarios}>
                      {[...materia.horarios]
                        .sort((a, b) => {
                          const diferencia =
                            diasOrden.indexOf(a.dia) - diasOrden.indexOf(b.dia)

                          return diferencia || a.inicio.localeCompare(b.inicio)
                        })
                        .map((horario, indice) => (
                          <div className={styles.horario} key={indice}>
                            <span>{horario.dia}</span>
                            <strong>
                              {horario.inicio} a {horario.fin} hs
                            </strong>
                          </div>
                        ))}
                    </div>
                  </div>

                  <div className={styles.bloqueEstadisticas}>
                    <h4>Resumen de asistencia</h4>

                    <div className={styles.estadisticas}>
                      <div className={styles.estadistica}>
                        <strong>{materia.presentes}</strong>
                        <span>Presentes</span>
                      </div>

                      <div className={styles.estadistica}>
                        <strong>{materia.tardanzas}</strong>
                        <span>Tardanzas</span>
                      </div>

                      <div className={styles.estadistica}>
                        <strong>{materia.ausentes}</strong>
                        <span>Ausentes</span>
                      </div>

                      <div className={styles.estadistica}>
                        <strong>{materia.justificadas}</strong>
                        <span>Justificadas</span>
                      </div>

                      <div className={styles.estadistica}>
                        <strong>{materia.total}</strong>
                        <span>Clases computadas</span>
                      </div>
                    </div>

                    <p className={styles.aclaracion}>
                      Las tardanzas cuentan como asistencia. Las ausencias
                      justificadas y las clases suspendidas no se incluyen
                      en el cálculo del porcentaje.
                    </p>
                  </div>

                  <div className={styles.bloqueClases}>
                    <h4>Registro de clases</h4>

                    {materia.clasesFiltradas.length === 0 ? (
                      <p className={styles.sinClases}>
                        No hay clases registradas para este período.
                      </p>
                    ) : (
                      <div className={styles.listaClases}>
                        {[...materia.clasesFiltradas]
                          .sort((a, b) => a.fecha.localeCompare(b.fecha))
                          .map((clase) => (
                            <div className={styles.filaClase} key={clase.fecha}>
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

      <p className={styles.notaDemo}>
        Información de demostración. Los datos son ficticios y se reemplazarán
        cuando se conecte el sistema con la información real.
      </p>
    </main>
  )
}

export default MisCursos
