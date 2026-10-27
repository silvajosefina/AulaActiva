import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Alert, Button, Divider, Form, Input, Typography } from 'antd'
import { MailOutlined } from '@ant-design/icons'
import AuthLayout from '../../components/AuthLayout/AuthLayout'
import { ROUTES } from '../../constants/routes'
import styles from './RecuperarContrasena.module.css'

const { Paragraph } = Typography

interface RecuperarFormValues {
  email: string
}

function RecuperarContrasena() {
  const [enviado, setEnviado] = useState(false)

  const handleFinish = () => {
    setEnviado(true)
  }

  return (
    <AuthLayout
      title="Recuperar contraseña"
      subtitle="Ingresá el email con el que creaste tu cuenta"
    >
      {enviado && (
        <Alert
          type="info"
          showIcon
          title="El envío por mail todavía no está activo"
          description="Mientras tanto, pedile a quien administra AulaActiva en tu institución que te ayude a restablecer la contraseña."
          className={styles.alert}
        />
      )}

      <Form<RecuperarFormValues>
        layout="vertical"
        onFinish={handleFinish}
        onValuesChange={() => setEnviado(false)}
        requiredMark={false}
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
