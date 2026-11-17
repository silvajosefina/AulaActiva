import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Alert, Button, Divider, Form, Input, Typography } from 'antd'
import { LockOutlined } from '@ant-design/icons'
import AuthLayout from '../../components/AuthLayout/AuthLayout'
import { ROUTES } from '../../constants/routes'
import { AuthError, restablecerContrasena } from '../../services/auth'
import styles from './RestablecerContrasena.module.css'

const { Paragraph } = Typography

interface RestablecerFormValues {
  nueva: string
  confirmacion: string
}

function RestablecerContrasena() {
  const navigate = useNavigate()
  const [parametros] = useSearchParams()
  const token = parametros.get('token') ?? ''

  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFinish = async ({ nueva }: RestablecerFormValues) => {
    setGuardando(true)
    setError(null)
    try {
      await restablecerContrasena(token, nueva)
      navigate(ROUTES.LOGIN, { replace: true, state: { contrasenaRestablecida: true } })
    } catch (err) {
      setError(err instanceof AuthError ? err.message : 'No pudimos restablecer la contraseña.')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <AuthLayout
      title="Elegí una nueva contraseña"
      subtitle="Usá al menos 6 caracteres"
    >
      {!token && (
        <Alert
          type="error"
          showIcon
          title="El link de recuperación no es válido"
          description="Abrí el link completo que te llegó por mail, o pedí uno nuevo."
          className={styles.alert}
        />
      )}

      {error && (
        <Alert
          type="error"
          showIcon
          title={error}
          closable
          onClose={() => setError(null)}
          className={styles.alert}
        />
      )}

      <Form<RestablecerFormValues>
        layout="vertical"
        onFinish={handleFinish}
        requiredMark={false}
        disabled={guardando || !token}
      >
        <Form.Item
          name="nueva"
          label="Nueva contraseña"
          rules={[
            { required: true, message: 'Ingresá la nueva contraseña' },
            { min: 6, message: 'La contraseña debe tener al menos 6 caracteres' },
          ]}
        >
          <Input.Password
            prefix={<LockOutlined className={styles.icon} />}
            autoComplete="new-password"
            size="large"
          />
        </Form.Item>

        <Form.Item
          name="confirmacion"
          label="Repetí la nueva contraseña"
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
          <Input.Password
            prefix={<LockOutlined className={styles.icon} />}
            autoComplete="new-password"
            size="large"
          />
        </Form.Item>

        <Form.Item className={styles.submitItem}>
          <Button
            type="primary"
            htmlType="submit"
            block
            size="large"
            loading={guardando}
            className={styles.submitButton}
          >
            Guardar contraseña
          </Button>
        </Form.Item>
      </Form>

      <Divider className={styles.divider} />

      <Paragraph className={styles.footerText}>
        ¿El link venció? <Link to={ROUTES.RECUPERAR_CONTRASENA}>Pedí uno nuevo</Link>
      </Paragraph>
    </AuthLayout>
  )
}

export default RestablecerContrasena
