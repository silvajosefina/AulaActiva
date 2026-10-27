import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Alert, Button, Checkbox, Divider, Form, Input, Radio, Typography, message } from 'antd'
import { LockOutlined, UserOutlined } from '@ant-design/icons'
import AuthLayout from '../../components/AuthLayout/AuthLayout'
import { AuthError, login, saveSession } from '../../services/auth'
import { ROUTES } from '../../constants/routes'
import styles from './Login.module.css'

const { Link, Paragraph } = Typography

type RolSeleccionado = 'ALUMNO' | 'DOCENTE'

interface LoginFormValues {
  rol: RolSeleccionado
  usuario: string
  contrasena: string
  recordarme: boolean
}

function Login() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [messageApi, contextHolder] = message.useMessage()
  const navigate = useNavigate()
  const location = useLocation()
  const recienRegistrado = (location.state as { registrado?: boolean } | null)?.registrado === true

  const handleFinish = async (values: LoginFormValues) => {
    setError(null)
    setLoading(true)
    try {
      const { token, usuario } = await login(values.usuario, values.contrasena)
      saveSession(token, usuario, values.recordarme)

      if (usuario.rol === 'DOCENTE') {
        navigate(ROUTES.PROFESOR_INICIO)
      } else {
        messageApi.info('La pantalla de Alumno todavía está en construcción.')
      }
    } catch (err) {
      setError(
        err instanceof AuthError
          ? err.message
          : 'No pudimos iniciar sesión. Intentá de nuevo.',
      )
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = () => {
    messageApi.info('Esta función estará disponible próximamente.')
  }

  const handleCreateAccount = () => {
    navigate(ROUTES.REGISTRO)
  }

  return (
    <AuthLayout
      title="Iniciar sesión"
      subtitle="Accedé con tu usuario institucional"
    >
      {contextHolder}

      {recienRegistrado && !error && (
        <Alert
          type="success"
          title="Tu cuenta se creó. Ya podés iniciar sesión."
          showIcon
          className={styles.alert}
        />
      )}

      {error && (
        <Alert
          type="error"
          title={error}
          showIcon
          closable
          onClose={() => setError(null)}
          className={styles.alert}
        />
      )}

      <Form<LoginFormValues>
        layout="vertical"
        onFinish={handleFinish}
        requiredMark={false}
        disabled={loading}
        initialValues={{ recordarme: false }}
      >
        <Form.Item
          name="rol"
          label="Ingresás como"
          rules={[{ required: true, message: 'Elegí si ingresás como Alumno o Docente' }]}
        >
          <Radio.Group size="large" buttonStyle="solid" className={styles.roleGroup}>
            <Radio.Button value="ALUMNO" className={styles.roleButton}>
              Alumno
            </Radio.Button>
            <Radio.Button value="DOCENTE" className={styles.roleButton}>
              Docente
            </Radio.Button>
          </Radio.Group>
        </Form.Item>

        <Form.Item
          name="usuario"
          label="Usuario"
          rules={[{ required: true, message: 'Ingresá tu usuario' }]}
        >
          <Input
            prefix={<UserOutlined className={styles.icon} />}
            placeholder="Usuario"
            autoComplete="username"
            size="large"
          />
        </Form.Item>

        <Form.Item
          name="contrasena"
          label="Contraseña"
          rules={[
            { required: true, message: 'Ingresá tu contraseña' },
            { min: 6, message: 'La contraseña debe tener al menos 6 caracteres' },
          ]}
        >
          <Input.Password
            prefix={<LockOutlined className={styles.icon} />}
            placeholder="Contraseña"
            autoComplete="current-password"
            size="large"
          />
        </Form.Item>

        <div className={styles.optionsRow}>
          <Form.Item name="recordarme" valuePropName="checked" noStyle>
            <Checkbox>Recordarme</Checkbox>
          </Form.Item>
          <Link onClick={handleForgotPassword}>¿Olvidaste tu contraseña?</Link>
        </div>

        <Form.Item className={styles.submitItem}>
          <Button
            type="primary"
            htmlType="submit"
            block
            loading={loading}
            size="large"
            className={styles.submitButton}
          >
            Iniciar sesión
          </Button>
        </Form.Item>
      </Form>

      <Divider className={styles.divider} />

      <Paragraph className={styles.createAccount}>
        ¿No tenés cuenta? <Link onClick={handleCreateAccount}>Registrate</Link>
      </Paragraph>
    </AuthLayout>
  )
}

export default Login
