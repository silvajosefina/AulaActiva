import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Alert, Button, Col, Divider, Form, Input, Radio, Row, Typography } from 'antd'
import { LockOutlined, MailOutlined, UserOutlined } from '@ant-design/icons'
import AuthLayout from '../../components/AuthLayout/AuthLayout'
import { AuthError, register, type RolUsuario } from '../../services/auth'
import { ROUTES } from '../../constants/routes'
import styles from './Registro.module.css'

const { Paragraph } = Typography

interface RegistroFormValues {
  rol: RolUsuario
  nombre: string
  apellido: string
  email: string
  usuario: string
  contrasena: string
  confirmarContrasena: string
}

function Registro() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFinish = async (values: RegistroFormValues) => {
    setError(null)
    setLoading(true)
    try {
      await register({
        rol: values.rol,
        nombre: values.nombre.trim(),
        apellido: values.apellido.trim(),
        email: values.email.trim(),
        usuario: values.usuario.trim(),
        contrasena: values.contrasena,
      })
      navigate(ROUTES.LOGIN, { state: { registrado: true } })
    } catch (err) {
      setError(
        err instanceof AuthError
          ? err.message
          : 'No pudimos crear la cuenta. Intentá de nuevo.',
      )
      setLoading(false)
    }
  }

  return (
    <AuthLayout title="Crear cuenta" subtitle="Registrate para usar AulaActiva">
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

      <Form<RegistroFormValues>
        layout="vertical"
        onFinish={handleFinish}
        requiredMark={false}
        disabled={loading}
      >
        <Form.Item
          name="rol"
          label="Te registrás como"
          rules={[{ required: true, message: 'Elegí si te registrás como Alumno o Docente' }]}
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

        <Row gutter={12}>
          <Col xs={24} sm={12}>
            <Form.Item
              name="nombre"
              label="Nombre"
              rules={[{ required: true, whitespace: true, message: 'Ingresá tu nombre' }]}
            >
              <Input placeholder="Nombre" autoComplete="given-name" size="large" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              name="apellido"
              label="Apellido"
              rules={[{ required: true, whitespace: true, message: 'Ingresá tu apellido' }]}
            >
              <Input placeholder="Apellido" autoComplete="family-name" size="large" />
            </Form.Item>
          </Col>
        </Row>

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

        <Form.Item
          name="usuario"
          label="Usuario"
          extra="Con este nombre vas a iniciar sesión."
          rules={[
            { required: true, message: 'Elegí un nombre de usuario' },
            { pattern: /^\S+$/, message: 'El usuario no puede tener espacios' },
          ]}
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
            { required: true, message: 'Elegí una contraseña' },
            { min: 6, message: 'La contraseña debe tener al menos 6 caracteres' },
          ]}
        >
          <Input.Password
            prefix={<LockOutlined className={styles.icon} />}
            placeholder="Contraseña"
            autoComplete="new-password"
            size="large"
          />
        </Form.Item>

        <Form.Item
          name="confirmarContrasena"
          label="Repetí la contraseña"
          dependencies={['contrasena']}
          rules={[
            { required: true, message: 'Repetí la contraseña' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('contrasena') === value) {
                  return Promise.resolve()
                }
                return Promise.reject(new Error('Las contraseñas no coinciden'))
              },
            }),
          ]}
        >
          <Input.Password
            prefix={<LockOutlined className={styles.icon} />}
            placeholder="Repetí la contraseña"
            autoComplete="new-password"
            size="large"
          />
        </Form.Item>

        <Form.Item className={styles.submitItem}>
          <Button
            type="primary"
            htmlType="submit"
            block
            loading={loading}
            size="large"
            className={styles.submitButton}
          >
            Crear cuenta
          </Button>
        </Form.Item>
      </Form>

      <Divider className={styles.divider} />

      <Paragraph className={styles.footerText}>
        ¿Ya tenés cuenta? <Link to={ROUTES.LOGIN}>Iniciá sesión</Link>
      </Paragraph>
    </AuthLayout>
  )
}

export default Registro
