import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import styles from './PanelAlumno.module.css'
import { ROUTES } from '../../constants/routes'
import {
  obtenerCursosAlumno,
  obtenerAsistenciasAlumno,
  type CursoAlumno,
  type AsistenciaAlumno,
} from '../../services/alumno'
import {
  obtenerEventosPersonales,
  type EventoPersonal,
} from '../../services/agendaPersonal'
import { clearSession, getSessionUser } from '../../services/auth'

const diasOrden = [
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
  'Domingo',
]

const nombresMeses = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
]

function fechaLocal(fecha: Date) {
  const anio = fecha.getFullYear()
  const mes = String(fecha.getMonth() + 1).padStart(2, '0')
  const dia = String(fecha.getDate()).padStart(2, '0')

  return `${anio}-${mes}-${dia}`
}

function obtenerInicioSemana(fecha: Date) {
  const inicio = new Date(fecha)
  const dia = inicio.getDay()
  const diferencia = dia === 0 ? -6 : 1 - dia

  inicio.setDate(inicio.getDate() + diferencia)
  inicio.setHours(0, 0, 0, 0)

  return inicio
}

function sumarDias(fecha: Date, cantidad: number) {
  const resultado = new Date(fecha)
  resultado.setDate(resultado.getDate() + cantidad)

  return resultado
}

function formatearDia(fecha: Date) {
  return `${fecha.getDate()} de ${nombresMeses[fecha.getMonth()]}`
}

function obtenerNombreMes(fecha: Date) {
  return `${nombresMeses[fecha.getMonth()]} ${fecha.getFullYear()}`
}

function PanelAlumno() {
  const navigate = useNavigate()
  const usuario = getSessionUser()
  const nombreAlumno = usuario?.nombre?.trim()
  const saludo = nombreAlumno ? `¡Hola, ${nombreAlumno}!` : '¡Hola!'

  const [cursos, setCursos] = useState<CursoAlumno[]>([])
  const [asistencias, setAsistencias] = useState<AsistenciaAlumno[]>([])
  const [eventosPersonales, setEventosPersonales] = useState<EventoPersonal[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(false)

  const [semanaActual, setSemanaActual] = useState(
    () => obtenerInicioSemana(new Date()),
  )

  function cerrarSesion() {
    clearSession()
    navigate(ROUTES.LOGIN, { replace: true })
  }

  // Cargamos cursos, asistencias y eventos desde el Backend.
  useEffect(() => {
    let activo = true

    async function cargarDatos() {
      try {
        const [
          cursosRecibidos,
          asistenciasRecibidas,
          eventosRecibidos,
        ] = await Promise.all([
          obtenerCursosAlumno(),
          obtenerAsistenciasAlumno(),
          obtenerEventosPersonales(),
        ])

        if (activo) {
          setCursos(cursosRecibidos)
          setAsistencias(asistenciasRecibidas)
          setEventosPersonales(eventosRecibidos)
        }
      } catch (err) {
        console.error('Error al cargar el panel del alumno:', err)

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

  const diasSemana = useMemo(() => {
    return diasOrden.map((dia, indice) => {
      const fecha = sumarDias(semanaActual, indice)
      const fechaISO = fechaLocal(fecha)

      const clases = cursos.flatMap((curso) =>
        curso.horarios
          .filter((horario) => horario.dia === dia)
          .map((horario) => ({
            materia: curso.materia.nombre,
            anio: curso.anio,
            comision: curso.comision,
            inicio: horario.inicio,
            fin: horario.fin,
          })),
      )

      clases.sort((a, b) => a.inicio.localeCompare(b.inicio))

      const eventos = eventosPersonales
        .filter((evento) => evento.fecha === fechaISO)
        .sort((a, b) =>
          (a.horaInicio ?? '').localeCompare(b.horaInicio ?? ''),
        )

      return {
        dia,
        fecha,
        fechaISO,
        clases,
        eventos,
        esHoy: fechaISO === fechaLocal(new Date()),
      }
    })
  }, [cursos, semanaActual, eventosPersonales])

  const resumenAsistencia = useMemo(() => {
    const computables = asistencias.filter(
      (asistencia) =>
        asistencia.estado !== 'JUSTIFICADA' &&
        asistencia.estado !== 'SUSPENDIDA',
    )

    const presentes = computables.filter(
      (asistencia) => asistencia.estado === 'PRESENTE',
    ).length

    const tardanzas = computables.filter(
      (asistencia) => asistencia.estado === 'TARDANZA',
    ).length

    const ausentes = computables.filter(
      (asistencia) => asistencia.estado === 'AUSENTE',
    ).length

    const justificadas = asistencias.filter(
      (asistencia) => asistencia.estado === 'JUSTIFICADA',
    ).length

    const suspendidas = asistencias.filter(
      (asistencia) => asistencia.estado === 'SUSPENDIDA',
    ).length

    const total = computables.length

    const porcentaje =
      total > 0
        ? Math.round(((presentes + tardanzas) / total) * 100)
        : null

    return {
      presentes,
      tardanzas,
      ausentes,
      justificadas,
      suspendidas,
      total,
      porcentaje,
    }
  }, [asistencias])

  const clasePorcentaje =
    resumenAsistencia.porcentaje === null
      ? ''
      : resumenAsistencia.porcentaje >= 80
        ? styles.porcentajeVerde
        : resumenAsistencia.porcentaje >= 60
          ? styles.porcentajeAmarillo
          : styles.porcentajeRojo

  function cambiarSemana(cantidad: number) {
    setSemanaActual((semana) => sumarDias(semana, cantidad * 7))
  }

  function volverAHoy() {
    setSemanaActual(obtenerInicioSemana(new Date()))
  }

  return (
    <main className={styles.layout}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.brand}>
            <span className={styles.logoMark}>A</span>
            <span className={styles.brandText}>AulaActiva</span>
          </div>

          <div className={styles.headerActions}>
            <span className={styles.nombreHeader}>
              {nombreAlumno || 'Espacio del alumno'}
            </span>

            <button
              type="button"
              className={styles.botonPerfil}
              onClick={() => navigate(ROUTES.ALUMNO_PERFIL)}
            >
              Mi perfil
            </button>

            <button
              type="button"
              className={styles.botonSalir}
              onClick={cerrarSesion}
            >
              Salir
            </button>
          </div>
        </div>
      </header>

      <div className={styles.content}>
        <div className={styles.container}>
          <section className={styles.bienvenida}>
            <p className={styles.etiqueta}>AULA ACTIVA</p>
            <h1 className={styles.titulo}>{saludo}</h1>
            <p className={styles.subtitulo}>
              Consultá tus cursos, seguí tus asistencias y organizá tus
              actividades académicas.
            </p>
          </section>

          <section className={styles.agenda}>
            <div className={styles.agendaEncabezado}>
              <div className={styles.agendaTitulo}>
                <span className={styles.agendaIcono}>▦</span>
                <div>
                  <h2>Mi agenda semanal</h2>
                  <p>
                    Tus horarios de cursada y tus compromisos personales.
                  </p>
                </div>
              </div>

              <div className={styles.agendaNavegacion}>
                <button
                  type="button"
                  className={styles.botonSemana}
                  onClick={() => cambiarSemana(-1)}
                  aria-label="Semana anterior"
                >
                  ←
                </button>

                <button
                  type="button"
                  className={styles.botonHoy}
                  onClick={volverAHoy}
                >
                  Hoy
                </button>

                <button
                  type="button"
                  className={styles.botonSemana}
                  onClick={() => cambiarSemana(1)}
                  aria-label="Semana siguiente"
                >
                  →
                </button>
              </div>
            </div>

            <p className={styles.agendaPeriodo}>
              {formatearDia(semanaActual)} —{' '}
              {formatearDia(sumarDias(semanaActual, 6))}
              {' · '}
              {obtenerNombreMes(semanaActual)}
            </p>

            {cargando ? (
              <p>Cargando tu agenda...</p>
            ) : error ? (
              <p role="alert">
                No pudimos cargar tus horarios. Intentá nuevamente más tarde.
              </p>
            ) : (
              <div className={styles.agendaGrid}>
                {diasSemana.map((dia) => {
                  const tieneActividades =
                    dia.clases.length > 0 || dia.eventos.length > 0

                  return (
                    <article
                      className={[
                        styles.diaCard,
                        dia.clases.length > 0
                          ? styles.diaConClases
                          : styles.diaLibre,
                        dia.esHoy ? styles.diaHoy : '',
                      ].join(' ')}
                      key={dia.fechaISO}
                    >
                      <div className={styles.diaEncabezado}>
                        <span className={styles.diaNombre}>
                          {dia.dia}
                        </span>

                        <span className={styles.diaFecha}>
                          {formatearDia(dia.fecha)}
                        </span>

                        {dia.esHoy && (
                          <span className={styles.etiquetaHoy}>
                            Hoy
                          </span>
                        )}
                      </div>

                      {!tieneActividades ? (
                        <p className={styles.diaSinClases}>
                          Sin actividades
                        </p>
                      ) : (
                        <div className={styles.listaClases}>
                          {dia.clases.map((clase, indice) => (
                            <div
                              className={styles.claseItem}
                              key={`${clase.materia}-${clase.inicio}-${indice}`}
                            >
                              <strong className={styles.claseMateria}>
                                {clase.materia}
                              </strong>

                              <span className={styles.claseHorario}>
                                {clase.inicio} a {clase.fin} hs
                              </span>

                              <span className={styles.claseComision}>
                                {clase.anio}° Año · Comisión {clase.comision}
                              </span>
                            </div>
                          ))}

                          {dia.eventos.map((evento) => (
                            <div
                              className={styles.claseItem}
                              key={evento.id}
                            >
                              <strong className={styles.claseMateria}>
                                {evento.titulo}
                              </strong>

                              <span className={styles.claseHorario}>
                                {evento.horaInicio
                                  ? `${evento.horaInicio}${evento.horaFin ? ` a ${evento.horaFin}` : ''} hs`
                                  : evento.tipo}
                              </span>

                              <span className={styles.etiquetaEventoPersonal}>
                                Compromiso personal · {evento.tipo}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </article>
                  )
                })}
              </div>
            )}

            <div className={styles.agendaPie}>
              <div className={styles.referenciasAgenda}>
                <span>
                  <i className={styles.referenciaVerde} />
                  Cursada
                </span>

                <span>
                  <i className={styles.referenciaNaranja} />
                  Compromiso personal
                </span>

                <span>
                  <i className={styles.referenciaHoy} />
                  Día actual
                </span>
              </div>

              <Link
                to={ROUTES.ALUMNO_CURSOS}
                className={styles.enlaceCursos}
              >
                Ver mis cursos →
              </Link>
            </div>

            <p className={styles.notaAgenda}>
              Tu agenda reúne los horarios de cursada y los compromisos que
              organizás en Mi Agenda Personal.
            </p>
          </section>

          <section className={styles.seccion}>
            <div className={styles.seccionTitulo}>
              <h2>Mi asistencia</h2>

              <Link
                to={ROUTES.ALUMNO_ASISTENCIAS}
                className={styles.enlaceCursos}
              >
                Ver detalle →
              </Link>
            </div>

            {cargando ? (
              <p>Cargando resumen de asistencia...</p>
            ) : error ? (
              <p role="alert">
                No pudimos cargar el resumen de asistencia.
              </p>
            ) : (
              <div className={styles.resumenCard}>
                <div className={styles.resumenSuperior}>
                  <span className={styles.iconoResumen}>✓</span>
                  <span>Resumen</span>
                </div>

                <div className={styles.presente}>
                  <strong className={styles.cantidad}>
                    {resumenAsistencia.presentes}
                  </strong>
                  <span>Presentes</span>
                </div>

                <div className={styles.tarde}>
                  <strong className={styles.cantidad}>
                    {resumenAsistencia.tardanzas}
                  </strong>
                  <span>Tardanzas</span>
                </div>

                <div className={styles.ausente}>
                  <strong className={styles.cantidad}>
                    {resumenAsistencia.ausentes}
                  </strong>
                  <span>Ausentes</span>
                </div>

                <div className={styles.justificada}>
                  <strong className={styles.cantidad}>
                    {resumenAsistencia.justificadas}
                  </strong>
                  <span>Justificadas</span>
                </div>

                <div className={styles.suspendida}>
                  <strong className={styles.cantidad}>
                    {resumenAsistencia.suspendidas}
                  </strong>
                  <span>Suspendidas</span>
                </div>

                <div className={styles.porcentaje}>
                  <strong
                    className={`${styles.cantidad} ${clasePorcentaje}`}
                  >
                    {resumenAsistencia.porcentaje === null
                      ? '—'
                      : `${resumenAsistencia.porcentaje}%`}
                  </strong>
                  <span>Asistencia</span>
                </div>
              </div>
            )}
          </section>

          <section className={styles.seccion}>
            <div className={styles.seccionTitulo}>
              <h2>Mis espacios</h2>
            </div>

            <p className={styles.descripcionSeccion}>
              Ingresá a cada sección para consultar y organizar tu información.
            </p>

            <div className={styles.acceso}>
              <article
                className={`${styles.accesoCard} ${styles.accesoCursos}`}
              >
                <div className={styles.accesoContenido}>
                  <span className={styles.accesoIcono}>▣</span>

                  <div className={styles.accesoTexto}>
                    <h3>Mis Cursos</h3>
                    <p>
                      Consultá tus materias, horarios y seguimiento de
                      asistencia.
                    </p>
                  </div>
                </div>

                <Link
                  to={ROUTES.ALUMNO_CURSOS}
                  className={styles.botonAcceso}
                >
                  Consultar →
                </Link>
              </article>

              <article
                className={`${styles.accesoCard} ${styles.accesoAsistencias}`}
              >
                <div className={styles.accesoContenido}>
                  <span className={styles.accesoIcono}>✓</span>

                  <div className={styles.accesoTexto}>
                    <h3>Mis Asistencias</h3>
                    <p>
                      Revisá el registro de tus clases y tus estados de
                      asistencia.
                    </p>
                  </div>
                </div>

                <Link
                  to={ROUTES.ALUMNO_ASISTENCIAS}
                  className={styles.botonAcceso}
                >
                  Consultar →
                </Link>
              </article>

              <article
                className={`${styles.accesoCard} ${styles.accesoAgenda}`}
              >
                <div className={styles.accesoContenido}>
                  <span className={styles.accesoIcono}>▤</span>

                  <div className={styles.accesoTexto}>
                    <h3>Mi Agenda Personal</h3>
                    <p>
                      Organizá parciales, finales, entregas y tus
                      compromisos.
                    </p>
                  </div>
                </div>

                <Link
                  to={ROUTES.ALUMNO_AGENDA_PERSONAL}
                  className={styles.botonAcceso}
                >
                  Organizar mi agenda →
                </Link>
              </article>
            </div>
          </section>
        </div>
      </div>

      <footer className={styles.footer}>
        <p>AulaActiva · Tu espacio académico</p>
      </footer>
    </main>
  )
}

export default PanelAlumno