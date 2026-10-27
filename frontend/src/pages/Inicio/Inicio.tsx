import { useNavigate } from 'react-router-dom'
import { Avatar, Button, Card, Col, Grid, Layout, Row, Tag, Typography, message } from 'antd'
import {
  CheckCircleOutlined,
  CheckOutlined,
  HistoryOutlined,
  LoginOutlined,
  MobileOutlined,
  ScheduleOutlined,
  TeamOutlined,
  UserAddOutlined,
} from '@ant-design/icons'
import { ROUTES } from '../../constants/routes'
import styles from './Inicio.module.css'

const { Header, Content, Footer } = Layout
const { Title, Paragraph, Text } = Typography
const { useBreakpoint } = Grid

const SECCIONES = [
  { id: 'funcionalidades', label: 'Funcionalidades' },
  { id: 'como-funciona', label: 'Cómo funciona' },
  { id: 'para-quien', label: 'Para quién' },
]

const NIVELES = ['Jardín', 'Primario', 'Secundario', 'Terciario', 'Universitario']

const FUNCIONALIDADES = [
  {
    icon: <CheckCircleOutlined />,
    titulo: 'Carga de asistencia ágil',
    texto: 'Los docentes marcan presentes, ausentes y llegadas tarde de toda la cursada en pocos clics.',
  },
  {
    icon: <HistoryOutlined />,
    titulo: 'Historial siempre disponible',
    texto: 'Cada alumno consulta las materias en las que está inscripto y su registro de asistencias.',
  },
  {
    icon: <TeamOutlined />,
    titulo: 'Varios docentes por curso',
    texto: 'Un mismo curso puede tener más de un profesor a cargo, como ocurre en el nivel universitario.',
  },
  {
    icon: <MobileOutlined />,
    titulo: 'Desde cualquier dispositivo',
    texto: 'Funciona en computadoras, tablets y celulares, sin instalar nada.',
  },
]

const PASOS = [
  {
    titulo: 'Iniciá sesión',
    texto: 'Ingresá con tu usuario institucional, como docente o como alumno.',
  },
  {
    titulo: 'Elegí la cursada',
    texto: 'Seleccioná la materia y la fecha de la clase que querés gestionar.',
  },
  {
    titulo: 'Registrá y consultá',
    texto: 'Los docentes cargan la asistencia y los alumnos ven su historial al instante.',
  },
]

const PERFILES = [
  {
    titulo: 'Para docentes',
    items: [
      'Registrar la asistencia de cada clase',
      'Marcar a toda la cursada de una sola vez',
      'Ver el resumen de presentes, ausentes y tardanzas',
    ],
  },
  {
    titulo: 'Para alumnos',
    items: [
      'Consultar las materias en las que estás inscripto',
      'Revisar tu historial de asistencias',
      'Acceder desde el celular en cualquier momento',
    ],
  },
]

const VISTA_PREVIA = [
  { iniciales: 'LF', nombre: 'Lucía Fernández', estado: 'Presente', color: 'success' },
  { iniciales: 'MG', nombre: 'Mateo González', estado: 'Presente', color: 'success' },
  { iniciales: 'SM', nombre: 'Sofía Martínez', estado: 'Tarde', color: 'warning' },
  { iniciales: 'TR', nombre: 'Tomás Rodríguez', estado: 'Ausente', color: 'error' },
]

function Inicio() {
  const navigate = useNavigate()
  const screens = useBreakpoint()
  const [messageApi, contextHolder] = message.useMessage()

  const irALogin = () => navigate(ROUTES.LOGIN)

  const registrarse = () => {
    messageApi.info('Esta función estará disponible próximamente.')
  }

  const irASeccion = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <Layout className={styles.layout}>
      {contextHolder}

      <Header className={styles.header}>
        <div className={styles.headerInner}>
          <button type="button" className={styles.brand} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <span className={styles.logoMark}>
              <ScheduleOutlined />
            </span>
            <span className={styles.brandText}>AulaActiva</span>
          </button>

          {screens.md && (
            <nav className={styles.nav}>
              {SECCIONES.map((seccion) => (
                <Button key={seccion.id} type="text" onClick={() => irASeccion(seccion.id)}>
                  {seccion.label}
                </Button>
              ))}
            </nav>
          )}

          <div className={styles.headerActions}>
            {screens.sm && (
              <Button onClick={registrarse}>Registrarse</Button>
            )}
            <Button type="primary" icon={<LoginOutlined />} onClick={irALogin}>
              Iniciar sesión
            </Button>
          </div>
        </div>
      </Header>

      <Content>
        <section className={styles.hero}>
          <div className={styles.container}>
            <Row gutter={[{ xs: 16, lg: 48 }, 40]} align="middle">
              <Col xs={24} lg={13}>
                <Tag variant="filled" className={styles.eyebrow}>
                  Control de asistencia para instituciones educativas
                </Tag>
                <Title className={styles.heroTitle}>
                  La asistencia de tu institución, organizada en un solo lugar
                </Title>
                <Paragraph className={styles.heroText}>
                  AulaActiva permite a los docentes registrar la asistencia de cada clase y a los
                  alumnos consultar sus materias e historial, desde el jardín hasta la universidad.
                </Paragraph>

                <div className={styles.heroActions}>
                  <Button type="primary" size="large" icon={<LoginOutlined />} onClick={irALogin}>
                    Iniciar sesión
                  </Button>
                  <Button size="large" icon={<UserAddOutlined />} onClick={registrarse}>
                    Registrarse
                  </Button>
                </div>

                <div className={styles.niveles}>
                  <Text type="secondary" className={styles.nivelesLabel}>
                    Pensado para todos los niveles:
                  </Text>
                  <div className={styles.nivelesTags}>
                    {NIVELES.map((nivel) => (
                      <Tag key={nivel} className={styles.nivelTag}>
                        {nivel}
                      </Tag>
                    ))}
                  </div>
                </div>
              </Col>

              <Col xs={24} lg={11}>
                <Card className={styles.preview} variant="borderless">
                  <div className={styles.previewHead}>
                    <div>
                      <Text strong className={styles.previewTitle}>
                        Bases de Datos
                      </Text>
                      <Text type="secondary" className={styles.previewSub}>
                        Comisión 2K1 · Clase de hoy
                      </Text>
                    </div>
                    <Tag variant="filled" className={styles.previewBadge}>
                      Vista previa
                    </Tag>
                  </div>

                  <div className={styles.previewList}>
                    {VISTA_PREVIA.map((alumno) => (
                      <div key={alumno.nombre} className={styles.previewRow}>
                        <div className={styles.previewAlumno}>
                          <Avatar size={34} className={styles.previewAvatar}>
                            {alumno.iniciales}
                          </Avatar>
                          <Text className={styles.previewNombre}>{alumno.nombre}</Text>
                        </div>
                        <Tag color={alumno.color} variant="filled">
                          {alumno.estado}
                        </Tag>
                      </div>
                    ))}
                  </div>

                  <div className={styles.previewFoot}>
                    <Text type="secondary">2 presentes · 1 tarde · 1 ausente</Text>
                  </div>
                </Card>
              </Col>
            </Row>
          </div>
        </section>

        <section id="funcionalidades" className={styles.section}>
          <div className={styles.container}>
            <div className={styles.sectionHead}>
              <Title level={2} className={styles.sectionTitle}>
                Todo lo necesario para gestionar la asistencia
              </Title>
              <Paragraph className={styles.sectionText}>
                Herramientas simples para el día a día de docentes y alumnos.
              </Paragraph>
            </div>

            <Row gutter={[20, 20]}>
              {FUNCIONALIDADES.map((item) => (
                <Col key={item.titulo} xs={24} sm={12} lg={6}>
                  <Card className={styles.featureCard}>
                    <span className={styles.featureIcon}>{item.icon}</span>
                    <Title level={5} className={styles.featureTitle}>
                      {item.titulo}
                    </Title>
                    <Paragraph className={styles.featureText}>{item.texto}</Paragraph>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        </section>

        <section id="como-funciona" className={`${styles.section} ${styles.sectionAlt}`}>
          <div className={styles.container}>
            <div className={styles.sectionHead}>
              <Title level={2} className={styles.sectionTitle}>
                Cómo funciona
              </Title>
              <Paragraph className={styles.sectionText}>
                Tres pasos, sin configuraciones complicadas.
              </Paragraph>
            </div>

            <Row gutter={[20, 20]}>
              {PASOS.map((paso, index) => (
                <Col key={paso.titulo} xs={24} md={8}>
                  <div className={styles.step}>
                    <span className={styles.stepNumber}>{index + 1}</span>
                    <Title level={5} className={styles.featureTitle}>
                      {paso.titulo}
                    </Title>
                    <Paragraph className={styles.featureText}>{paso.texto}</Paragraph>
                  </div>
                </Col>
              ))}
            </Row>
          </div>
        </section>

        <section id="para-quien" className={styles.section}>
          <div className={styles.container}>
            <div className={styles.sectionHead}>
              <Title level={2} className={styles.sectionTitle}>
                Una plataforma, dos miradas
              </Title>
              <Paragraph className={styles.sectionText}>
                Cada rol ve exactamente lo que necesita.
              </Paragraph>
            </div>

            <Row gutter={[20, 20]}>
              {PERFILES.map((perfil) => (
                <Col key={perfil.titulo} xs={24} md={12}>
                  <Card className={styles.profileCard}>
                    <Title level={4} className={styles.profileTitle}>
                      {perfil.titulo}
                    </Title>
                    <ul className={styles.profileList}>
                      {perfil.items.map((item) => (
                        <li key={item}>
                          <CheckOutlined className={styles.profileCheck} />
                          <Text>{item}</Text>
                        </li>
                      ))}
                    </ul>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        </section>

        <section className={styles.cta}>
          <div className={`${styles.container} ${styles.ctaInner}`}>
            <div>
              <Title level={3} className={styles.ctaTitle}>
                ¿Listo para empezar?
              </Title>
              <Paragraph className={styles.ctaText}>
                Ingresá con tu usuario institucional y empezá a usar AulaActiva.
              </Paragraph>
            </div>
            <div className={styles.heroActions}>
              <Button type="primary" size="large" icon={<LoginOutlined />} onClick={irALogin}>
                Iniciar sesión
              </Button>
              <Button size="large" icon={<UserAddOutlined />} onClick={registrarse}>
                Registrarse
              </Button>
            </div>
          </div>
        </section>
      </Content>

      <Footer className={styles.footer}>
        <div className={styles.container}>
          <Row gutter={[32, 32]}>
            <Col xs={24} md={12}>
              <div className={styles.footerBrand}>
                <span className={styles.logoMark}>
                  <ScheduleOutlined />
                </span>
                <span className={styles.brandText}>AulaActiva</span>
              </div>
              <Paragraph className={styles.footerText}>
                Sistema de gestión de asistencia para instituciones educativas de todos los niveles.
              </Paragraph>
            </Col>

            <Col xs={12} md={6}>
              <Text strong className={styles.footerHeading}>
                Secciones
              </Text>
              <ul className={styles.footerLinks}>
                {SECCIONES.map((seccion) => (
                  <li key={seccion.id}>
                    <button type="button" onClick={() => irASeccion(seccion.id)}>
                      {seccion.label}
                    </button>
                  </li>
                ))}
              </ul>
            </Col>

            <Col xs={12} md={6}>
              <Text strong className={styles.footerHeading}>
                Acceso
              </Text>
              <ul className={styles.footerLinks}>
                <li>
                  <button type="button" onClick={irALogin}>
                    Iniciar sesión
                  </button>
                </li>
                <li>
                  <button type="button" onClick={registrarse}>
                    Registrarse
                  </button>
                </li>
              </ul>
            </Col>
          </Row>

          <div className={styles.footerBottom}>
            <Text type="secondary">© {new Date().getFullYear()} AulaActiva · Gestión de asistencia</Text>
          </div>
        </div>
      </Footer>
    </Layout>
  )
}

export default Inicio
