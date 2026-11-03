
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Button,
  Card,
  Layout,
  Select,
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
import styles from './MisAsistencias.module.css'
import {
  materiasDemo,
  type EstadoAsistencia,
} from '../../data/materiasDemo'

const { Header, Content, Footer } = Layout
const { Title, Text, Paragraph } = Typography

interface RegistroAsistencia {
  key: string
  fecha: string
  materia: string
  estado: EstadoAsistencia
}

const estadoTexto: Record<EstadoAsistencia, string> = {
  PRESENTE: 'Presente',
  AUSENTE: 'Ausente',
  TARDANZA: 'Tardanza',
  JUSTIFICADA: 'Justificada',
  SUSPENDIDA: 'Suspendida',
}

const estadoCodigo: Record<EstadoAsistencia, string> = {
  PRESENTE: 'P',
  AUSENTE: 'A',
  TARDANZA: 'T',
  JUSTIFICADA: 'J',
  SUSPENDIDA: 'S',
}

function formatearFecha(fecha: string) {
  const [anio, mes, dia] = fecha.split('-')
  return `${dia}/${mes}/${anio}`
}

function MisAsistencias() {
  const navigate = useNavigate()

  const [materiaSeleccionada, setMateriaSeleccionada] = useState<number>(
    materiasDemo[0]?.id ?? 0,
  )

  const materiaActual = materiasDemo.find(
    (materia) => materia.id === materiaSeleccionada,
  )

  const registros: RegistroAsistencia[] = materiaActual
    ? materiaActual.clases
        .map((clase) => ({
          key: `${materiaActual.id}-${clase.fecha}`,
          fecha: formatearFecha(clase.fecha),
          materia: materiaActual.nombre,
          estado: clase.estado,
        }))
        .sort((a, b) => {
          const [diaA, mesA, anioA] = a.fecha.split('/')
          const [diaB, mesB, anioB] = b.fecha.split('/')

          const fechaA = `${anioA}-${mesA}-${diaA}`
          const fechaB = `${anioB}-${mesB}-${diaB}`

          return fechaA.localeCompare(fechaB)
        })
    : []

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
      render: (estado: EstadoAsistencia) => {
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
            onClick={() => navigate('/alumno')}
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
              Consultá tus registros de asistencia por materia.
            </Paragraph>
          </div>

          <Card className={styles.historialCard} bordered={false}>
            <div className={styles.tablaEncabezado}>
              <div>
                <Title level={4}>
                  {materiaActual?.nombre ?? 'Sin materia seleccionada'}
                </Title>

                <Text type="secondary">
                  {materiaActual?.comision ?? ''}
                </Text>
              </div>

              <Tag className={styles.cantidadRegistros}>
                {registros.length} registros
              </Tag>
            </div>

            <div>
              <Text strong>Seleccioná una materia:</Text>

              <Select
                className={styles.selectorMateria}
                value={materiaSeleccionada}
                onChange={(valor) => setMateriaSeleccionada(valor)}
                options={materiasDemo.map((materia) => ({
                  value: materia.id,
                  label: materia.nombre,
                }))}
                style={{ width: '100%', marginTop: 8, marginBottom: 20 }}
              />
            </div>

            <Table<RegistroAsistencia>
              columns={columnas}
              dataSource={registros}
              pagination={{ pageSize: 6, showSizeChanger: false }}
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
                  ] as EstadoAsistencia[]
                ).map((estado) => {
                  const codigo = estadoCodigo[estado]
                  const claseEstado = styles[`estado${codigo}`] ?? ''

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
          </Card>

          <p className={styles.notaDemo}>
            Información de demostración. Los datos son ficticios y se
            reemplazarán cuando se conecte el sistema con la información real.
          </p>
        </div>
      </Content>

      <Footer className={styles.footer}>
        AulaActiva · Mi espacio académico
      </Footer>
    </Layout>
  )
}

export default MisAsistencias
