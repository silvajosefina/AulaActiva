
import { useEffect, useState } from 'react'
import {
  Card,
  Layout,
  Select,
  Space,
  Spin,
  Table,
  Tag,
  Typography,
} from 'antd'
import type { TableColumnsType } from 'antd'
import { CalendarOutlined } from '@ant-design/icons'
import EncabezadoAlumno from '../../components/EncabezadoAlumno/EncabezadoAlumno'
import styles from './MisAsistencias.module.css'
import {
  obtenerCursosAlumno,
  obtenerAsistenciasAlumno,
  type CursoAlumno,
  type AsistenciaAlumno,
  type EstadoAsistenciaAlumno,
} from '../../services/alumno'

const { Content, Footer } = Layout
const { Title, Text, Paragraph } = Typography

interface RegistroAsistencia {
  key: string
  fecha: string
  materia: string
  estado: EstadoAsistenciaAlumno
}

type EstadoGrafico = Exclude<
  EstadoAsistenciaAlumno,
  'SUSPENDIDA'
>

const estadoTexto: Record<EstadoAsistenciaAlumno, string> = {
  PRESENTE: 'Presente',
  AUSENTE: 'Ausente',
  TARDANZA: 'Tardanza',
  JUSTIFICADA: 'Justificada',
  SUSPENDIDA: 'Suspendida',
}

const estadoCodigo: Record<EstadoAsistenciaAlumno, string> = {
  PRESENTE: 'P',
  AUSENTE: 'A',
  TARDANZA: 'T',
  JUSTIFICADA: 'J',
  SUSPENDIDA: 'S',
}

// Colores de los estados, compartidos por ambos gráficos.
const coloresEstado: Record<EstadoGrafico, string> = {
  PRESENTE: '#8DBB45',
  TARDANZA: '#4B91C5',
  JUSTIFICADA: '#E9A13B',
  AUSENTE: '#D85B58',
}

const ordenEstadosGrafico: EstadoGrafico[] = [
  'PRESENTE',
  'TARDANZA',
  'JUSTIFICADA',
  'AUSENTE',
]

function formatearFecha(fecha: string) {
  const [anio, mes, dia] = fecha.split('-')
  return `${dia}/${mes}/${anio}`
}

function MisAsistencias() {
  const [cursos, setCursos] = useState<CursoAlumno[]>([])
  const [asistencias, setAsistencias] = useState<AsistenciaAlumno[]>([])
  const [cursoSeleccionado, setCursoSeleccionado] =
    useState<number | undefined>(undefined)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  // Cargamos los cursos y las asistencias reales del alumno.
  useEffect(() => {
    let activo = true

    async function cargarDatos() {
      try {
        setCargando(true)
        setError('')

        const [cursosObtenidos, asistenciasObtenidas] =
          await Promise.all([
            obtenerCursosAlumno(),
            obtenerAsistenciasAlumno(),
          ])

        if (!activo) return

        setCursos(cursosObtenidos)
        setAsistencias(asistenciasObtenidas)

        // Seleccionamos el primer curso disponible.
        if (cursosObtenidos.length > 0) {
          setCursoSeleccionado(cursosObtenidos[0].idCurso)
        }
      } catch (error) {
        if (!activo) return

        console.error('Error al cargar las asistencias:', error)
        setError(
          'No pudimos cargar tus asistencias. Intentá nuevamente más tarde.',
        )
      } finally {
        if (activo) {
          setCargando(false)
        }
      }
    }

    void cargarDatos()

    return () => {
      activo = false
    }
  }, [])

  const cursoActual = cursos.find(
    (curso) => curso.idCurso === cursoSeleccionado,
  )

  // Filtramos por curso, para no mezclar comisiones ni períodos.
  const registros: RegistroAsistencia[] = asistencias
    .filter(
      (asistencia) => asistencia.idCurso === cursoSeleccionado,
    )
    .map((asistencia) => ({
      key: String(asistencia.idAsistencia),
      fecha: asistencia.fecha,
      materia: asistencia.materia,
      estado: asistencia.estado,
    }))
    .sort((a, b) => a.fecha.localeCompare(b.fecha))

  // Las justificadas y suspendidas no participan
  // del cálculo del porcentaje de asistencia.
  const registrosComputables = registros.filter(
    (registro) =>
      registro.estado !== 'JUSTIFICADA' &&
      registro.estado !== 'SUSPENDIDA',
  )

  const cantidadSuspendidas = registros.filter(
    (registro) => registro.estado === 'SUSPENDIDA',
  ).length

  const cantidadJustificadas = registros.filter(
    (registro) => registro.estado === 'JUSTIFICADA',
  ).length

  const totalClasesComputables = registrosComputables.length

  const cantidadPresentes = registros.filter(
    (registro) => registro.estado === 'PRESENTE',
  ).length

  const cantidadTardanzas = registros.filter(
    (registro) => registro.estado === 'TARDANZA',
  ).length

  const cantidadAsistencias = cantidadPresentes + cantidadTardanzas

  const porcentajeAsistencia =
    totalClasesComputables > 0
      ? Math.round(
          (cantidadAsistencias / totalClasesComputables) * 100,
        )
      : 0

  // El semáforo evalúa el porcentaje general de asistencia.
  const estadoSemaforo =
    totalClasesComputables === 0
      ? 'sinDatos'
      : porcentajeAsistencia < 60
        ? 'rojo'
        : porcentajeAsistencia < 80
          ? 'amarillo'
          : 'verde'

  const claseSemaforo = {
    rojo: styles.semaforoRojo,
    amarillo: styles.semaforoAmarillo,
    verde: styles.semaforoVerde,
    sinDatos: styles.semaforoSinDatos,
  }[estadoSemaforo]

  const textoSemaforo = {
    rojo: 'Asistencia baja',
    amarillo: 'Asistencia intermedia',
    verde: 'Buena asistencia',
    sinDatos: 'Sin datos suficientes',
  }[estadoSemaforo]

  // El número del porcentaje utiliza el mismo color del semáforo.
  const clasePorcentaje = {
    rojo: styles.porcentajeRojo,
    amarillo: styles.porcentajeAmarillo,
    verde: styles.porcentajeVerde,
    sinDatos: '',
  }[estadoSemaforo]

  // Los gráficos muestran todos los estados, excepto las suspendidas.
  // Las justificadas aparecen en los gráficos, pero no en el porcentaje.
  const totalRegistrosGrafico = registros.filter(
    (registro) => registro.estado !== 'SUSPENDIDA',
  ).length

  const resumenEstados = ordenEstadosGrafico.map((estado) => ({
    estado,
    nombre: estadoTexto[estado],
    cantidad: registros.filter(
      (registro) => registro.estado === estado,
    ).length,
    color: coloresEstado[estado],
  }))

  let porcentajeAcumulado = 0

  const segmentosTorta = resumenEstados
    .filter((item) => item.cantidad > 0)
    .map((item) => {
      const inicio = porcentajeAcumulado

      porcentajeAcumulado +=
        (item.cantidad / totalRegistrosGrafico) * 100

      return `${item.color} ${inicio}% ${porcentajeAcumulado}%`
    })
    .join(', ')

  const fondoTorta =
    totalRegistrosGrafico > 0
      ? `conic-gradient(${segmentosTorta})`
      : '#edf0f4'

  const columnas: TableColumnsType<RegistroAsistencia> = [
    {
      title: 'Fecha',
      dataIndex: 'fecha',
      key: 'fecha',
      render: (fecha: string) => formatearFecha(fecha),
    },
    {
      title: 'Materia',
      dataIndex: 'materia',
      key: 'materia',
    },
    {
      title: 'Estado',
      dataIndex: 'estado',
      key: 'estado',
      render: (estado: EstadoAsistenciaAlumno) => {
        const codigo = estadoCodigo[estado]
        const claseEstado = styles[`estado${codigo}`] ?? ''

        return (
          <Tag className={`${styles.estadoTag} ${claseEstado}`}>
            {codigo} · {estadoTexto[estado]}
          </Tag>
        )
      },
    },
  ]

  return (
    <Layout className={styles.layout}>
      <EncabezadoAlumno />

      <Content className={styles.content}>
        <div className={styles.container}>
          <div className={styles.introduccion}>
            <Space className={styles.eyebrow}>
              <CalendarOutlined />
              MI HISTORIAL
            </Space>

            <Title level={1} className={styles.titulo}>
              Mis asistencias
            </Title>

            <Paragraph className={styles.subtitulo}>
              Consultá tus registros de asistencia por materia.
            </Paragraph>
          </div>

          <Card className={styles.historialCard} variant="borderless">
            {error && (
              <Paragraph type="danger">
                {error}
              </Paragraph>
            )}

            <div className="tablaEncabezado">
              <div className={styles.tablaEncabezado}>
                <div>
                  <Title level={4}>
                    {cursoActual?.materia.nombre ??
                      'Sin materia seleccionada'}
                  </Title>

                  <Text type="secondary">
                    {cursoActual
                      ? `${cursoActual.anio}° año · Comisión ${cursoActual.comision} · ${cursoActual.periodo}`
                      : ''}
                  </Text>
                </div>

                <Tag className={styles.cantidadRegistros}>
                  {registros.length} registros
                </Tag>
              </div>
            </div>

            <div>
              <Text strong>Seleccioná una materia:</Text>

              <Select
                className={styles.selectorMateria}
                value={cursoSeleccionado}
                onChange={setCursoSeleccionado}
                disabled={cargando || cursos.length === 0}
                options={cursos.map((curso) => ({
                  value: curso.idCurso,
                  label: `${curso.materia.nombre} · Comisión ${curso.comision} · ${curso.periodo}`,
                }))}
                style={{
                  width: '100%',
                  marginTop: 8,
                  marginBottom: 20,
                }}
                placeholder="Seleccioná un curso"
              />
            </div>

            {cargando ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <Spin description="Cargando tus asistencias..." />
              </div>
            ) : (
              <>
                {/* Resumen general de asistencia */}
                <section className={styles.resumenAsistencia}>
                  <div className={styles.resumenTexto}>
                    <Text strong>Porcentaje de asistencia</Text>

                    <div className={styles.indicadorPorcentaje}>
                      <span
                        className={`${styles.porcentajeValor} ${clasePorcentaje}`}
                      >
                        {porcentajeAsistencia}%
                      </span>

                      <Tag
                        className={`${styles.semaforoTag} ${claseSemaforo}`}
                      >
                        {textoSemaforo}
                      </Tag>
                    </div>

                    <Text type="secondary">
                      {cantidadAsistencias} asistencias sobre{' '}
                      {totalClasesComputables} clases computables.
                    </Text>
                  </div>

                  <div className={styles.resumenDatos}>
                    <div>
                      <strong>{totalClasesComputables}</strong>
                      <span>Clases computables</span>
                    </div>

                    <div>
                      <strong>{cantidadSuspendidas}</strong>
                      <span>Suspendidas</span>
                    </div>
                  </div>
                </section>

                {/* Gráficos estadísticos */}
                <section className={styles.graficos}>
                  <article className={styles.graficoCard}>
                    <Title level={5}>Asistencia por estado</Title>

                    <Text type="secondary">
                      Cantidad de clases según su resultado.
                    </Text>

                    <div
                      className={styles.graficoBarras}
                      role="img"
                      aria-label="Gráfico de barras con la cantidad de clases por estado"
                    >
                      {resumenEstados.map((item) => {
                        const porcentajeBarra =
                          totalRegistrosGrafico > 0
                            ? (item.cantidad /
                                totalRegistrosGrafico) *
                              100
                            : 0

                        return (
                          <div
                            className={styles.filaBarra}
                            key={item.estado}
                          >
                            <div className={styles.etiquetaBarra}>
                              <span>{item.nombre}</span>
                              <strong>{item.cantidad}</strong>
                            </div>

                            <div className={styles.barraFondo}>
                              <div
                                className={styles.barraValor}
                                style={{
                                  width: `${porcentajeBarra}%`,
                                  backgroundColor: item.color,
                                }}
                              />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </article>

                  <article className={styles.graficoCard}>
                    <Title level={5}>
                      Distribución de asistencias
                    </Title>

                    <Text type="secondary">
                      Proporción de cada estado sobre los registros
                      no suspendidos.
                    </Text>

                    <div className={styles.tortaContenedor}>
                      <div
                        className={styles.graficoTorta}
                        style={{ background: fondoTorta }}
                        role="img"
                        aria-label="Gráfico circular con la distribución de estados de asistencia"
                      >
                        <div className={styles.centroTorta}>
                          <strong>{totalRegistrosGrafico}</strong>
                          <span>Registros</span>
                        </div>
                      </div>
                    </div>

                    <div className={styles.leyendaTorta}>
                      {resumenEstados.map((item) => (
                        <div
                          className={styles.itemLeyenda}
                          key={item.estado}
                        >
                          <span
                            className={styles.puntoLeyenda}
                            style={{ backgroundColor: item.color }}
                          />

                          <span>{item.nombre}</span>
                          <strong>{item.cantidad}</strong>
                        </div>
                      ))}
                    </div>
                  </article>
                </section>

                {cantidadJustificadas > 0 && (
                  <p className={styles.notaSuspendidas}>
                    Hay {cantidadJustificadas}{' '}
                    {cantidadJustificadas === 1
                      ? 'clase justificada'
                      : 'clases justificadas'}
                    . No se incluyen en el cálculo del porcentaje de
                    asistencia.
                  </p>
                )}

                {cantidadSuspendidas > 0 && (
                  <p className={styles.notaSuspendidas}>
                    Hay {cantidadSuspendidas}{' '}
                    {cantidadSuspendidas === 1
                      ? 'clase suspendida'
                      : 'clases suspendidas'}
                    . No se incluyen en el cálculo del porcentaje ni
                    en los gráficos estadísticos.
                  </p>
                )}

                <Title level={5} className={styles.tituloTabla}>
                  Historial de clases
                </Title>

                <Table<RegistroAsistencia>
                  columns={columnas}
                  dataSource={registros}
                  loading={cargando}
                  pagination={{
                    pageSize: 6,
                    showSizeChanger: false,
                  }}
                  scroll={{ x: 480 }}
                  locale={{
                    emptyText: 'No hay registros de asistencia.',
                  }}
                />

                <div className={styles.referencias}>
                  <Text strong>Referencias de estados</Text>

                  <Space wrap size={[8, 8]}>
                    {(
                      [
                        'PRESENTE',
                        'AUSENTE',
                        'TARDANZA',
                        'JUSTIFICADA',
                        'SUSPENDIDA',
                      ] as EstadoAsistenciaAlumno[]
                    ).map((estado) => {
                      const codigo = estadoCodigo[estado]
                      const claseEstado =
                        styles[`estado${codigo}`] ?? ''

                      return (
                        <Tag
                          key={estado}
                          className={`${styles.estadoTag} ${claseEstado}`}
                        >
                          {codigo} · {estadoTexto[estado]}
                        </Tag>
                      )
                    })}
                  </Space>
                </div>
              </>
            )}
          </Card>

          <Paragraph type="secondary">
            Los registros corresponden a las asistencias registradas
            para tus cursos.
          </Paragraph>
        </div>
      </Content>

      <Footer className={styles.footer}>
        AulaActiva · Mi espacio académico
      </Footer>
    </Layout>
  )
}

export default MisAsistencias
