
import { useNavigate } from 'react-router-dom'
import {
  Button,
  Card,
  Layout,
  Space,
  Table,
  Tag,
  Typography,
} from 'antd'
import type { TableColumnsType } from 'antd'
import {
  ArrowLeftOutlined,
  CalendarOutlined,
  ScheduleOutlined,
} from '@ant-design/icons'
import { ROUTES } from '../../constants/routes'
import styles from './MisAsistencias.module.css'

const { Header, Content, Footer } = Layout
const { Title, Text, Paragraph } = Typography

type EstadoAsistencia = 'P' | 'A' | 'T' | 'J'

interface RegistroAsistencia {
  key: number
  fecha: string
  materia: string
  estado: EstadoAsistencia
}

const registros: RegistroAsistencia[] = [
  { key: 1, fecha: '05/10/2026', materia: 'Bases de Datos', estado: 'P' },
  { key: 2, fecha: '07/10/2026', materia: 'Bases de Datos', estado: 'P' },
  { key: 3, fecha: '09/10/2026', materia: 'Bases de Datos', estado: 'T' },
  { key: 4, fecha: '12/10/2026', materia: 'Bases de Datos', estado: 'A' },
  { key: 5, fecha: '14/10/2026', materia: 'Bases de Datos', estado: 'J' },
  { key: 6, fecha: '16/10/2026', materia: 'Bases de Datos', estado: 'P' },
  { key: 7, fecha: '19/10/2026', materia: 'Bases de Datos', estado: 'P' },
  { key: 8, fecha: '21/10/2026', materia: 'Bases de Datos', estado: 'T' },
]

const estadoTexto: Record<EstadoAsistencia, string> = {
  P: 'Presente',
  A: 'Ausente',
  T: 'Tarde',
  J: 'Justificada',
}

const columnas: TableColumnsType<RegistroAsistencia> = [
  {
    title: 'Fecha',
    dataIndex: 'fecha',
    key: 'fecha',
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
    render: (estado: EstadoAsistencia) => (
      <Tag className={`${styles.estadoTag} ${styles[`estado${estado}`]}`}>
        {estado} · {estadoTexto[estado]}
      </Tag>
    ),
  },
]

function MisAsistencias() {
  const navigate = useNavigate()

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

          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(ROUTES.ALUMNO)}
          >
            Volver al panel
          </Button>
        </div>
      </Header>

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
              Consultá tus registros de asistencia de la materia.
            </Paragraph>
          </div>

          <Card className={styles.historialCard} variant="borderless">
            <div className={styles.tablaEncabezado}>
              <div>
                <Title level={4}>Bases de Datos</Title>
                <Text type="secondary">Comisión 2K1 · Octubre de 2026</Text>
              </div>

              <Tag className={styles.cantidadRegistros}>
                {registros.length} registros
              </Tag>
            </div>

            <Table<RegistroAsistencia>
              columns={columnas}
              dataSource={registros}
              pagination={{ pageSize: 6, showSizeChanger: false }}
              scroll={{ x: 480 }}
            />

            <div className={styles.referencias}>
              <Text strong>Referencias de estados</Text>
              <Space wrap size={[8, 8]}>
                {(['P', 'A', 'T', 'J'] as EstadoAsistencia[]).map(
                  (estado) => (
                    <Tag
                      key={estado}
                      className={`${styles.estadoTag} ${styles[`estado${estado}`]}`}
                    >
                      {estado} · {estadoTexto[estado]}
                    </Tag>
                  ),
                )}
              </Space>
            </div>
          </Card>
        </div>
      </Content>

      <Footer className={styles.footer}>
        AulaActiva · Mi espacio académico
      </Footer>
    </Layout>
  )
}

export default MisAsistencias