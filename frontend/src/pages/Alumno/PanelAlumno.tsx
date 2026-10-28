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
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  LogoutOutlined,
  ScheduleOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { clearSession, getSessionUser } from '../../services/auth'
import { ROUTES } from '../../constants/routes'
import styles from './PanelAlumno.module.css'

const { Header, Content, Footer } = Layout
const { Title, Text, Paragraph } = Typography

function PanelAlumno() {
  const navigate = useNavigate()
  const usuario = getSessionUser()

  const alumno = {
    nombre: usuario ? `${usuario.nombre} ${usuario.apellido}` : 'Alumno',
    curso: 'Bases de Datos',
    comision: '2K1',
  }

  const cerrarSesion = () => {
    clearSession()
    navigate(ROUTES.LOGIN)
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
              onClick={cerrarSesion}
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

            <Card className={styles.cursoCard} variant="borderless">
              <Text className={styles.cursoLabel}>MI CURSO</Text>
              <Title level={4}>{alumno.curso}</Title>
              <Text>Comisión {alumno.comision}</Text>
            </Card>
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
                  <Card className={styles.resumenCard} variant="borderless">
                    <div className={styles.resumenSuperior}>
                      <span className={`${styles.iconoResumen} ${item.clase}`}>
                        {item.icono}
                      </span>
                      <Text type="secondary">{item.titulo}</Text>
                    </div>

                    <Title level={2} className={styles.cantidad}>
                      {item.cantidad}
                    </Title>
                    <Text type="secondary">registros</Text>
                  </Card>
                </Col>
              ))}
            </Row>
          </section>

          <section className={styles.acceso}>
            <Card variant="borderless" className={styles.historialCard}>
              <div className={styles.historialContenido}>
                <div className={styles.historialIcono}>
                  <FileTextOutlined />
                </div>

                <div className={styles.historialTexto}>
                  <Title level={4}>Mis asistencias</Title>
                  <Paragraph>
                    Consultá las fechas y el estado de cada registro,
                    incluidas las inasistencias justificadas.
                  </Paragraph>
                </div>

                <Button
                  type="primary"
                  className={styles.botonHistorial}
                  onClick={() => navigate(ROUTES.ALUMNO_ASISTENCIAS)}
                >
                  Ver historial
                </Button>
              </div>
            </Card>
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