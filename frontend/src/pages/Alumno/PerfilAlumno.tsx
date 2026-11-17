import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Alert,
  Avatar,
  Button,
  Card,
  Col,
  Descriptions,
  Form,
  Input,
  Layout,
  Row,
  Space,
  Spin,
  Typography,
  message,
} from 'antd'
import {
  LockOutlined,
  UserOutlined,
} from '@ant-design/icons'
import axios from 'axios'
import EncabezadoAlumno from '../../components/EncabezadoAlumno/EncabezadoAlumno'
import { ROUTES } from '../../constants/routes'
import { clearSession } from '../../services/auth'
import {
  actualizarContrasenaAlumno,
  obtenerPerfilAlumno,
  type PerfilAlumno as DatosPerfilAlumno,
} from '../../services/alumno'
import styles from './PerfilAlumno.module.css'

const { Content, Footer } = Layout
const { Title, Text, Paragraph } = Typography

interface FormularioContrasena {
  actual: string
  nueva: string
  confirmacion: string
}

function mensajeDeError(error: unknown, porDefecto: string): string {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    if (!error.response) {
      return 'No pudimos conectarnos con el servidor. Revisá que el backend esté levantado.'
    }
    return error.response.data?.message ?? porDefecto
  }
  return porDefecto
}

function PerfilAlumno() {
  const navigate = useNavigate()
  const [form] = Form.useForm<FormularioContrasena>()
  const [messageApi, contextHolder] = message.useMessage()

  const [perfil, setPerfil] = useState<DatosPerfilAlumno | null>(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [intento, setIntento] = useState(0)
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    let activo = true

    obtenerPerfilAlumno()
      .then((datos) => {
        if (activo) setPerfil(datos)
      })
      .catch((err) => {
        if (!activo) return
        if (axios.isAxiosError(err) && err.response?.status === 401) {
          clearSession()
          navigate(ROUTES.LOGIN, { replace: true })
          return
        }
        setError(mensajeDeError(err, 'No pudimos cargar tu perfil.'))
      })
      .finally(() => {
        if (activo) setCargando(false)
      })

    return () => {
      activo = false
    }
  }, [intento, navigate])

  const reintentar = () => {
    setCargando(true)
    setError(null)
    setIntento((n) => n + 1)
  }

  const cambiarContrasena = async (valores: FormularioContrasena) => {
    setGuardando(true)
    try {
      await actualizarContrasenaAlumno(valores.actual, valores.nueva)
      messageApi.success('Tu contraseña se actualizó correctamente.')
      form.resetFields()
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        clearSession()
        navigate(ROUTES.LOGIN, { replace: true })
        return
      }
      messageApi.error(mensajeDeError(err, 'No pudimos actualizar tu contraseña.'))
    } finally {
      setGuardando(false)
    }
  }

  const iniciales = perfil
    ? `${perfil.nombre.charAt(0)}${perfil.apellido.charAt(0)}`.toUpperCase()
    : ''

  return (
    <Layout className={styles.layout}>
      {contextHolder}

      <EncabezadoAlumno />

      <Content className={styles.content}>
        <div className={styles.container}>
          <div className={styles.introduccion}>
            <Space className={styles.eyebrow}>
              <UserOutlined />
              MI CUENTA
            </Space>

            <Title level={1} className={styles.titulo}>
              Mi perfil
            </Title>

            <Paragraph className={styles.subtitulo}>
              Consultá tus datos personales y cambiá tu contraseña.
            </Paragraph>
          </div>

          {cargando && (
            <div className={styles.cargando}>
              <Spin size="large" />
            </div>
          )}

          {!cargando && error && (
            <Alert
              type="error"
              showIcon
              title={error}
              action={
                <Button size="small" onClick={reintentar}>
                  Reintentar
                </Button>
              }
            />
          )}

          {!cargando && !error && perfil && (
            <Row gutter={[24, 24]}>
              <Col xs={24} lg={12}>
                <Card className={styles.card} variant="borderless">
                  <div className={styles.identidad}>
                    <Avatar size={64} className={styles.avatar}>
                      {iniciales}
                    </Avatar>
                    <div>
                      <Title level={4} className={styles.nombre}>
                        {perfil.nombre} {perfil.apellido}
                      </Title>
                      <Text type="secondary">Alumno · Legajo {perfil.legajo}</Text>
                    </div>
                  </div>

                  <Descriptions column={1} size="middle" className={styles.datos}>
                    <Descriptions.Item label="Nombre">{perfil.nombre}</Descriptions.Item>
                    <Descriptions.Item label="Apellido">{perfil.apellido}</Descriptions.Item>
                    <Descriptions.Item label="Correo electrónico">{perfil.email}</Descriptions.Item>
                    <Descriptions.Item label="Usuario">{perfil.usuario}</Descriptions.Item>
                    <Descriptions.Item label="Legajo">{perfil.legajo}</Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>

              <Col xs={24} lg={12}>
                <Card className={styles.card} variant="borderless">
                  <div className={styles.cardEncabezado}>
                    <span className={styles.cardIcono}>
                      <LockOutlined />
                    </span>
                    <div>
                      <Title level={4} className={styles.cardTitulo}>
                        Cambiar contraseña
                      </Title>
                      <Text type="secondary">
                        Usá al menos 6 caracteres.
                      </Text>
                    </div>
                  </div>

                  <Form
                    form={form}
                    layout="vertical"
                    requiredMark={false}
                    onFinish={cambiarContrasena}
                    disabled={guardando}
                  >
                    <Form.Item
                      label="Contraseña actual"
                      name="actual"
                      rules={[{ required: true, message: 'Ingresá tu contraseña actual' }]}
                    >
                      <Input.Password prefix={<LockOutlined />} size="large" autoComplete="current-password" />
                    </Form.Item>

                    <Form.Item
                      label="Nueva contraseña"
                      name="nueva"
                      rules={[
                        { required: true, message: 'Ingresá la nueva contraseña' },
                        { min: 6, message: 'La contraseña debe tener al menos 6 caracteres' },
                        ({ getFieldValue }) => ({
                          validator(_, valor) {
                            if (!valor || valor !== getFieldValue('actual')) return Promise.resolve()
                            return Promise.reject(new Error('Tiene que ser distinta de la actual'))
                          },
                        }),
                      ]}
                    >
                      <Input.Password prefix={<LockOutlined />} size="large" autoComplete="new-password" />
                    </Form.Item>

                    <Form.Item
                      label="Repetí la nueva contraseña"
                      name="confirmacion"
                      dependencies={['nueva']}
                      rules={[
                        { required: true, message: 'Repetí la nueva contraseña' },
                        ({ getFieldValue }) => ({
                          validator(_, valor) {
                            if (!valor || valor === getFieldValue('nueva')) return Promise.resolve()
                            return Promise.reject(new Error('Las contraseñas no coinciden'))
                          },
                        }),
                      ]}
                    >
                      <Input.Password prefix={<LockOutlined />} size="large" autoComplete="new-password" />
                    </Form.Item>

                    <Button type="primary" htmlType="submit" size="large" loading={guardando} block>
                      Actualizar contraseña
                    </Button>
                  </Form>
                </Card>
              </Col>
            </Row>
          )}
        </div>
      </Content>

      <Footer className={styles.footer}>AulaActiva · Mi espacio académico</Footer>
    </Layout>
  )
}

export default PerfilAlumno
