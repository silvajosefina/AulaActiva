
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Avatar,
  Button,
  Card,
  Col,
  Layout,
  Row,
  Space,
  Tag,
  Typography,
} from 'antd'
import {
  BookOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  LeftOutlined,
  LogoutOutlined,
  RightOutlined,
  ScheduleOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { materiasDemo } from '../../data/materiasDemo'
import styles from './PanelAlumno.module.css'

const { Header, Content, Footer } = Layout
const { Title, Text, Paragraph } = Typography

type ClaseAgenda = {
  materia: string
  horario: string
  comision: string
}

type DiaAgenda = {
  fecha: Date
  nombre: string
  clases: ClaseAgenda[]
}

const nombresDias = [
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
  'Domingo',
]

const indicesDias: Record<string, number> = {
  Lunes: 1,
  Martes: 2,
  Miércoles: 3,
  Jueves: 4,
  Viernes: 5,
  Sábado: 6,
  Domingo: 0,
}

const clasesPorDia: Record<number, ClaseAgenda[]> = {}

materiasDemo.forEach((materia) => {
  materia.horarios.forEach((horario) => {
    const indiceDia = indicesDias[horario.dia]

    if (indiceDia === undefined) {
      return
    }

    if (!clasesPorDia[indiceDia]) {
      clasesPorDia[indiceDia] = []
    }

    clasesPorDia[indiceDia].push({
      materia: materia.nombre,
      horario: `${horario.inicio} a ${horario.fin}`,
      comision: materia.comision,
    })
  })
})

Object.values(clasesPorDia).forEach((clases) => {
  clases.sort((a, b) => {
    const horaA = a.horario.split(' a ')[0]
    const horaB = b.horario.split(' a ')[0]

    return horaA.localeCompare(horaB)
  })
})

function obtenerInicioSemana(fecha: Date) {
  const inicio = new Date(
    fecha.getFullYear(),
    fecha.getMonth(),
    fecha.getDate(),
  )

  const dia = inicio.getDay()
  const diferencia = dia === 0 ? -6 : 1 - dia

  inicio.setDate(inicio.getDate() + diferencia)

  return inicio
}

function sumarDias(fecha: Date, cantidad: number) {
  const resultado = new Date(fecha)
  resultado.setDate(resultado.getDate() + cantidad)
  return resultado
}

function obtenerClaveFecha(fecha: Date) {
  const anio = fecha.getFullYear()
  const mes = String(fecha.getMonth() + 1).padStart(2, '0')
  const dia = String(fecha.getDate()).padStart(2, '0')

  return `${anio}-${mes}-${dia}`
}

function formatearFecha(fecha: Date) {
  return new Intl.DateTimeFormat('es-AR', {
    day: 'numeric',
    month: 'short',
  }).format(fecha)
}

function formatearPeriodo(inicio: Date, fin: Date) {
  const mesInicio = new Intl.DateTimeFormat('es-AR', {
    month: 'long',
  }).format(inicio)

  const mesFin = new Intl.DateTimeFormat('es-AR', {
    month: 'long',
    year: 'numeric',
  }).format(fin)

  if (
    inicio.getMonth() === fin.getMonth() &&
    inicio.getFullYear() === fin.getFullYear()
  ) {
    return `${inicio.getDate()} al ${fin.getDate()} de ${mesFin}`
  }

  return `${inicio.getDate()} de ${mesInicio} al ${fin.getDate()} de ${mesFin}`
}

function PanelAlumno() {
  const navigate = useNavigate()

  const [inicioSemana, setInicioSemana] = useState(() =>
    obtenerInicioSemana(new Date()),
  )

  const hoy = new Date()
  const claveHoy = obtenerClaveFecha(hoy)

  const alumno = {
    nombre: 'Lucía Fernández',
    comision: '2K1',
  }

  const resumen = [
    {
      titulo: 'Presentes',
      cantidad: 18,
      icono: <CheckCircleOutlined />,
      clase: styles.presente,
    },
    {
      titulo: 'Ausentes',
      cantidad: 2,
      icono: <CalendarOutlined />,
      clase: styles.ausente,
    },
    {
      titulo: 'Tardanzas',
      cantidad: 1,
      icono: <ClockCircleOutlined />,
      clase: styles.tarde,
    },
    {
      titulo: 'Justificadas',
      cantidad: 1,
      icono: <FileTextOutlined />,
      clase: styles.justificada,
    },
  ]

  const diasSemana: DiaAgenda[] = nombresDias.map((nombre, indice) => {
    const fecha = sumarDias(inicioSemana, indice)
    const indiceDia = indicesDias[nombre]

    return {
      fecha,
      nombre,
      clases: clasesPorDia[indiceDia] ?? [],
    }
  })

  const finSemana = sumarDias(inicioSemana, 6)

  function cambiarSemana(direccion: number) {
    setInicioSemana((semanaActual) =>
      sumarDias(semanaActual, direccion * 7),
    )
  }

  function volverASemanaActual() {
    setInicioSemana(obtenerInicioSemana(new Date()))
  }

  return (
    <Layout className={styles.layout}>
      <Header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.brand}>
            <span className={styles.logoMark}>
              <ScheduleOutlined />
            </span>
            <Text className={styles.brandText}>AulaActiva</Text>
          </div>

          <Space className={styles.headerActions}>
            <Avatar icon={<UserOutlined />} />
            <Text className={styles.nombreHeader}>
              {alumno.nombre}
            </Text>
            <Button
              icon={<LogoutOutlined />}
              onClick={() => navigate('/')}
            >
              Salir
            </Button>
          </Space>
        </div>
      </Header>

      <Content className={styles.content}>
        <div className={styles.container}>
          <section className={styles.bienvenida}>
            <Tag className={styles.etiqueta}>MI ESPACIO</Tag>

            <Title level={1} className={styles.titulo}>
              ¡Hola, {alumno.nombre.split(' ')[0]}!
            </Title>

            <Paragraph className={styles.subtitulo}>
              Consultá tu asistencia y seguí tu recorrido académico.
            </Paragraph>

            <section className={styles.agenda}>
              <div className={styles.agendaEncabezado}>
                <div className={styles.agendaTitulo}>
                  <span className={styles.agendaIcono}>
                    <CalendarOutlined />
                  </span>

                  <div>
                    <Title level={3}>Mi agenda</Title>
                    <Text type="secondary">
                      Tu semana de cursada
                    </Text>
                  </div>
                </div>

                <div className={styles.agendaNavegacion}>
                  <Button
                    className={styles.botonSemana}
                    icon={<LeftOutlined />}
                    onClick={() => cambiarSemana(-1)}
                    aria-label="Semana anterior"
                  />

                  <Button
                    className={styles.botonHoy}
                    onClick={volverASemanaActual}
                  >
                    Hoy
                  </Button>

                  <Button
                    className={styles.botonSemana}
                    icon={<RightOutlined />}
                    onClick={() => cambiarSemana(1)}
                    aria-label="Semana siguiente"
                  />
                </div>
              </div>

              <div className={styles.agendaPeriodo}>
                <Text>
                  {formatearPeriodo(inicioSemana, finSemana)}
                </Text>
              </div>

              <div
                className={styles.agendaGrid}
                key={obtenerClaveFecha(inicioSemana)}
              >
                {diasSemana.map((dia) => {
                  const esHoy =
                    obtenerClaveFecha(dia.fecha) === claveHoy

                  const tieneClases = dia.clases.length > 0

                  return (
                    <article
                      key={dia.nombre}
                      className={[
                        styles.diaCard,
                        tieneClases
                          ? styles.diaConClases
                          : styles.diaLibre,
                        esHoy ? styles.diaHoy : '',
                      ].join(' ')}
                    >
                      <div className={styles.diaEncabezado}>
                        <Text className={styles.diaNombre}>
                          {dia.nombre}
                        </Text>

                        {esHoy && (
                          <span className={styles.etiquetaHoy}>
                            HOY
                          </span>
                        )}
                      </div>

                      <Text className={styles.diaFecha}>
                        {formatearFecha(dia.fecha)}
                      </Text>

                      {tieneClases ? (
                        <div className={styles.listaClases}>
                          {dia.clases.map((clase) => (
                            <div
                              className={styles.claseItem}
                              key={`${dia.nombre}-${clase.materia}`}
                            >
                              <Text className={styles.claseMateria}>
                                {clase.materia}
                              </Text>

                              <span className={styles.claseHorario}>
                                <ClockCircleOutlined />
                                {clase.horario}
                              </span>

                              <span className={styles.claseComision}>
                                {clase.comision}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className={styles.diaSinClases}>
                          <CalendarOutlined />
                          <Text>Sin cursada</Text>
                        </div>
                      )}
                    </article>
                  )
                })}
              </div>

              <div className={styles.agendaPie}>
                <div className={styles.referenciasAgenda}>
                  <span>
                    <i className={styles.referenciaVerde} />
                    Día con cursada
                  </span>

                  <span>
                    <i className={styles.referenciaNaranja} />
                    Día libre
                  </span>

                  <span>
                    <i className={styles.referenciaHoy} />
                    Día actual
                  </span>
                </div>

                <Button
                  type="link"
                  className={styles.enlaceCursos}
                  icon={<BookOutlined />}
                  onClick={() => navigate('/alumno/cursos')}
                >
                  Ver mis cursos
                </Button>
              </div>

              <Text className={styles.notaAgenda}>
                Horarios de demostración. La agenda todavía no está
                conectada a los datos reales del sistema.
              </Text>
            </section>
          </section>

          <section className={styles.seccion}>
            <div className={styles.seccionTitulo}>
              <div>
                <Title level={2}>Mi asistencia</Title>
                <Text type="secondary">
                  Resumen de tus registros
                </Text>
              </div>
            </div>

            <Row gutter={[16, 16]}>
              {resumen.map((item) => (
                <Col xs={24} sm={12} lg={6} key={item.titulo}>
                  <Card
                    className={styles.resumenCard}
                    bordered={false}
                  >
                    <div className={styles.resumenSuperior}>
                      <span
                        className={`${styles.iconoResumen} ${item.clase}`}
                      >
                        {item.icono}
                      </span>
                      <Text type="secondary">{item.titulo}</Text>
                    </div>

                    <Title
                      level={2}
                      className={styles.cantidad}
                    >
                      {item.cantidad}
                    </Title>
                    <Text type="secondary">registros</Text>
                  </Card>
                </Col>
              ))}
            </Row>
          </section>

          <section className={styles.acceso}>
            <Row gutter={[20, 20]}>
              <Col xs={24} md={12}>
                <Card
                  bordered={false}
                  className={`${styles.accesoCard} ${styles.accesoCursos}`}
                >
                  <div className={styles.accesoContenido}>
                    <div className={styles.accesoIcono}>
                      <BookOutlined />
                    </div>

                    <div className={styles.accesoTexto}>
                      <Title level={4}>Mis cursos</Title>
                      <Paragraph>
                        Consultá tus materias, comisiones, horarios
                        y el detalle de tu asistencia en cada curso.
                      </Paragraph>
                    </div>

                    <Button
                      type="primary"
                      className={styles.botonAcceso}
                      onClick={() => navigate('/alumno/cursos')}
                    >
                      Ver mis cursos
                    </Button>
                  </div>
                </Card>
              </Col>

              <Col xs={24} md={12}>
                <Card
                  bordered={false}
                  className={`${styles.accesoCard} ${styles.accesoAsistencias}`}
                >
                  <div className={styles.accesoContenido}>
                    <div className={styles.accesoIcono}>
                      <FileTextOutlined />
                    </div>

                    <div className={styles.accesoTexto}>
                      <Title level={4}>Mis asistencias</Title>
                      <Paragraph>
                        Revisá las fechas y el estado de cada registro,
                        incluidas las inasistencias justificadas.
                      </Paragraph>
                    </div>

                    <Button
                      type="primary"
                      className={styles.botonAcceso}
                      onClick={() => navigate('/alumno/asistencias')}
                    >
                      Ver historial
                    </Button>
                  </div>
                </Card>
              </Col>
            </Row>
          </section>
        </div>
      </Content>

      <Footer className={styles.footer}>
        AulaActiva · Mi espacio académico
      </Footer>
    </Layout>
  )
}

export default PanelAlumno
