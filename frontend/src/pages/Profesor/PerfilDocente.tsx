import { useState } from 'react';
import { Card, Tabs, Form, Input, Button, Avatar, Typography, message } from 'antd';
import { UserOutlined, LockOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getSessionUser } from '../../services/auth';
import { actualizarPasswordDocente } from '../../services/docenteService';
import './PerfilDocente.css';

const { Title, Text } = Typography;

export default function PerfilDocente() {
  const usuario = getSessionUser();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleUpdatePassword = async (values: any) => {
    setLoading(true);
    try {
      await actualizarPasswordDocente({
        actual: values.actual,
        nueva: values.nueva,
      });

      message.success('Contraseña actualizada con éxito');
      form.resetFields();
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || error.response?.data?.mensaje || 'Error al actualizar la contraseña';
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const items = [
    {
      key: '1',
      label: (
        <span>
          <UserOutlined /> Datos Personales
        </span>
      ),
      children: (
        <Card variant="borderless" className="perfil-card">
          <div className="perfil-header-info">
            <Avatar size={72} icon={<UserOutlined />} className="perfil-avatar" />
            <div className="perfil-info-text">
              <Title level={4}>
                {usuario?.nombre} {usuario?.apellido}
              </Title>
              <Text type="secondary">
                Rol: <b>{usuario?.rol}</b> | Legajo: <b>{usuario?.legajo || 'N/D'}</b>
              </Text>
            </div>
          </div>
          <Form
            layout="vertical"
            initialValues={{
              nombre: usuario?.nombre,
              apellido: usuario?.apellido,
              email: usuario?.email,
            }}
          >
            <Form.Item label="Nombre" name="nombre">
              <Input disabled size="large" />
            </Form.Item>
            <Form.Item label="Apellido" name="apellido">
              <Input disabled size="large" />
            </Form.Item>
            <Form.Item label="Correo electrónico" name="email">
              <Input disabled size="large" />
            </Form.Item>
          </Form>
        </Card>
      ),
    },
    {
      key: '2',
      label: (
        <span>
          <LockOutlined /> Seguridad
        </span>
      ),
      children: (
        <Card title="Cambiar contraseña" variant="borderless" className="perfil-card">
          <Form form={form} layout="vertical" onFinish={handleUpdatePassword}>
            <Form.Item
              label="Contraseña actual"
              name="actual"
              rules={[{ required: true, message: 'Ingresá tu contraseña actual' }]}
            >
              <Input.Password prefix={<LockOutlined />} size="large" />
            </Form.Item>
            <Form.Item
              label="Nueva contraseña"
              name="nueva"
              rules={[{ required: true, min: 6, message: 'Mínimo 6 caracteres' }]}
            >
              <Input.Password prefix={<LockOutlined />} size="large" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} size="large">
                Actualizar contraseña
              </Button>
            </Form.Item>
          </Form>
        </Card>
      ),
    },
  ];

  return (
    <div className="perfil-container">
      <div className="perfil-header-top">
        <Title level={2} className="perfil-title">
          Mi Perfil
        </Title>
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate(-1)} 
          type="default"
        >
          Volver
        </Button>
      </div>
      <Tabs defaultActiveKey="1" items={items} size="large" />
    </div>
  );
}