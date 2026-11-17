import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Alert, Button, Divider, Form, Input, Typography } from 'antd'
import { MailOutlined } from '@ant-design/icons'
import AuthLayout from '../../components/AuthLayout/AuthLayout'
import { ROUTES } from '../../constants/routes'
import { AuthError, solicitarRecuperacion } from '../../services/auth'
import styles from './RecuperarContrasena.module.css'

const { Paragraph } = Typography

interface RecuperarFormValues {
  email: string
}

function RecuperarContrasena() {
  const [enviando, setEnviando] = useState(false)
  const [mensajeEnviado, setMensajeEnviado] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFinish = async ({ email }: RecuperarFormValues) => {
    setEnviando(true)
    setError(null)
    setMensajeEnviado(null)
    try {
      setMensajeEnviado(await solicitarRecuperacion(email))
    } catch (err) {
      setError(err instanceof AuthError ? err.message : 'No pudimos enviar el mail. Intentá de nuevo más tarde.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <AuthLayout
      title="Recuperar contraseña"
      subtitle="Ingresá el email con el que creaste tu cuenta"
    >
      {mensajeEnviado && (
        <Alert
          type="success"
          showIcon
          title="Revisá tu correo"
          description={`${mensajeEnviado}. El link vence en 30 minutos; si no lo ves, buscalo en spam.`}
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

      <Form<RecuperarFormValues>
        layout="vertical"
        onFinish={handleFinish}
        onValuesChange={() => {
          setMensajeEnviado(null)
          setError(null)
        }}
        requiredMark={false}
        disabled={enviando}
      >
        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: 'Ingresá tu email' },
            { type: 'email', message: 'Ingresá un email válido' },
          ]}
        >
          <Input
            prefix={<MailOutlined className={styles.icon} />}
            placeholder="nombre@ejemplo.com"
            autoComplete="email"
            size="large"
          />
        </Form.Item>

        <Form.Item className={styles.submitItem}>
          <Button
            type="primary"
            htmlType="submit"
            block
            size="large"
            loading={enviando}
            className={styles.submitButton}
          >
            Enviar instrucciones
          </Button>
        </Form.Item>
      </Form>

      <Divider className={styles.divider} />

      <Paragraph className={styles.footerText}>
        ¿Te acordaste? <Link to={ROUTES.LOGIN}>Volver a iniciar sesión</Link>
      </Paragraph>
    </AuthLayout>
  )
}

export default RecuperarContrasena
