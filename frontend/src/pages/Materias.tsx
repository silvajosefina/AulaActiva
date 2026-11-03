import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Layout,
  Menu,
  Typography,
  Button,
  Tag,
  Space,
  Avatar,
  Dropdown,
  ConfigProvider,
  Card,
  Row,
  Col,
  Input,
  message,
} from "antd";
import {
  HomeOutlined,
  ReadOutlined,
  CalendarOutlined,
  TeamOutlined,
  BookOutlined,
  UserOutlined,
  LogoutOutlined,
  DownOutlined,
  MenuOutlined,
  SearchOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import "dayjs/locale/es";
import locale from "antd/locale/es_ES";
import { clearSession, getSessionUser } from "../services/auth";
import { ROUTES } from "../constants/routes";
import "./Materias.css";

const { Sider, Header, Content } = Layout;
const { Title, Text } = Typography;

interface Materia {
  id: string;
  codigo: string;
  nombre: string;
  nivel: string;
  comisiones: string[];
  horasSemanales: number;
  estado: "En cursado" | "Finalizada" | "Planificada";
}

const materiasMock: Materia[] = [
  {
    id: "1",
    codigo: "K102",
    nombre: "Bases de Datos",
    nivel: "3er Año",
    comisiones: ["Comisión 1K1", "Comisión 1K2"],
    horasSemanales: 6,
    estado: "En cursado",
  },
  {
    id: "2",
    codigo: "K204",
    nombre: "Programación Web",
    nivel: "3er Año",
    comisiones: ["Comisión 2K1"],
    horasSemanales: 8,
    estado: "En cursado",
  },
  {
    id: "3",
    codigo: "K105",
    nombre: "Matemática Discreta",
    nivel: "1er Año",
    comisiones: ["Comisión 101"],
    horasSemanales: 5,
    estado: "Finalizada",
  },
];

export default function Materias() {
  const navigate = useNavigate();
  const usuario = getSessionUser();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [messageApi, contextHolder] = message.useMessage();

  const nombreCompleto = usuario
    ? `${usuario.nombre} ${usuario.apellido}`
    : "Docente";
  const iniciales = usuario
    ? `${usuario.nombre[0]}${usuario.apellido[0]}`
    : "DO";

  const cerrarSesion = () => {
    clearSession();
    navigate(ROUTES.LOGIN);
  };

  const materiasFiltradas = materiasMock.filter(
    (m) =>
      m.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      m.codigo.toLowerCase().includes(busqueda.toLowerCase())
  );

  const opcionesMenu = [
    { key: "inicio", icon: <HomeOutlined />, label: "Inicio" },
    { key: "cursos", icon: <ReadOutlined />, label: "Mis cursos" },
    { key: "asistencia", icon: <CalendarOutlined />, label: "Cargar asistencia" },
    { key: "alumnos", icon: <TeamOutlined />, label: "Mis alumnos" },
    { key: "materias", icon: <BookOutlined />, label: "Materias" },
  ];

  const menuUsuario = {
    items: [
      { key: "perfil", label: "Mi perfil", icon: <UserOutlined /> },
      { key: "salir", label: "Cerrar sesión", icon: <LogoutOutlined /> },
    ],
    onClick: ({ key }: { key: string }) => {
      if (key === "salir") cerrarSesion();
    },
  };

  return (
    <ConfigProvider
      locale={locale}
      theme={{
        token: {
          colorPrimary: "#bc9150",
          colorBgLayout: "#f7f5f0",
          colorText: "#26211a",
          colorTextSecondary: "#8d8676",
          borderRadius: 10,
          fontFamily:
            "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          controlHeight: 40,
        },
        components: {
          Menu: {
            itemSelectedBg: "#f1e4cd",
            itemSelectedColor: "#8a6530",
            itemColor: "#6b6557",
            itemBorderRadius: 9,
          },
        },
      }}
    >
      {contextHolder}
      <Layout className="materias-layout">
        <Sider
          width={238}
          theme="light"
          breakpoint="lg"
          collapsedWidth={0}
          trigger={null}
          className="materias-sidebar"
          style={{ background: "#fff" }}
        >
          <div className="materias-logo">
            <div className="materias-logo-icon">
              <BookOutlined />
            </div>
            <span>AulaActiva</span>
          </div>

          <Text className="materias-menu-label">MENÚ PRINCIPAL</Text>

          <Menu
            mode="inline"
            selectedKeys={["materias"]}
            items={opcionesMenu}
            onClick={({ key }) => {
              if (key === "inicio") return navigate(ROUTES.PROFESOR_INICIO);
              if (key === "cursos") return navigate(ROUTES.PROFESOR_CURSOS);
              if (key === "asistencia") return navigate(ROUTES.PROFESOR_ASISTENCIA);
              if (key === "alumnos") return navigate(ROUTES.PROFESOR_ALUMNOS);
              if (key === "materias") return;
              if (key === "materias") {
                navigate(ROUTES.PROFESOR_MATERIAS);
                return;
                }

              messageApi.info("Esta función estará disponible próximamente.");
            }}
            className="materias-menu"
          />

          <div className="materias-sidebar-bottom">
            <div className="materias-ayuda">
              <Text strong>¿Necesitás ayuda?</Text>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Consultá con el administrador del sistema.
              </Text>
            </div>

            <Button
              type="text"
              icon={<LogoutOutlined />}
              block
              style={{ textAlign: "left", color: "#6b6557" }}
              onClick={cerrarSesion}
            >
              Cerrar sesión
            </Button>
          </div>
        </Sider>

        <Layout style={{ minWidth: 0, background: "#f6f8f6" }}>
          <Header className="materias-header">
            <Button
              type="text"
              icon={<MenuOutlined />}
              className="materias-menu-mobile"
              onClick={() => setMenuAbierto(!menuAbierto)}
            />

            <div className="materias-header-right">
              <Avatar style={{ background: "#f1e4cd", color: "#8a6530" }}>
                {iniciales}
              </Avatar>

              <div>
                <Text strong style={{ display: "block" }}>
                  {nombreCompleto}
                </Text>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Docente
                </Text>
              </div>

              <Dropdown menu={menuUsuario} trigger={["click"]}>
                <Button type="text" icon={<DownOutlined />} />
              </Dropdown>
            </div>
          </Header>

          <Content className="materias-content">
            {/* ENCABEZADO Y BÚSQUEDA */}
            <div className="materias-encabezado">
              <div>
                <Title level={2} style={{ margin: 0, color: "#26211a" }}>
                  Materias a Cargo
                </Title>
                <Text type="secondary" style={{ fontSize: 14 }}>
                  Plan de estudio, comisiones y programas asignados
                </Text>
              </div>

              <Input
                placeholder="Buscar materia o código..."
                prefix={<SearchOutlined style={{ color: "#9a9284" }} />}
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                style={{ width: 260, borderRadius: 8 }}
                allowClear
              />
            </div>

            {/* GRILLA DE MATERIAS */}
            <Row gutter={[20, 20]}>
              {materiasFiltradas.map((materia) => (
                <Col xs={24} md={12} lg={8} key={materia.id}>
                  <Card
                    bordered={false}
                    className="materia-card"
                    actions={[
                      <Button
                        type="link"
                        icon={<FileTextOutlined />}
                        style={{ color: "#8a6530" }}
                        onClick={() =>
                          messageApi.info(`Programa de ${materia.nombre} descargado.`)
                        }
                      >
                        Ver Programa
                      </Button>,
                    ]}
                  >
                    <div className="materia-card-top">
                      <Tag color="gold" style={{ borderRadius: 6 }}>
                        {materia.codigo}
                      </Tag>
                      <Tag
                        color={
                          materia.estado === "En cursado" ? "green" : "default"
                        }
                        style={{ borderRadius: 6 }}
                      >
                        {materia.estado}
                      </Tag>
                    </div>

                    <Title level={4} style={{ margin: "12px 0 4px" }}>
                      {materia.nombre}
                    </Title>
                    <Text type="secondary" style={{ fontSize: 13 }}>
                      {materia.nivel}
                    </Text>

                    <div className="materia-detalles">
                      <div className="materia-detalle-item">
                        <ClockCircleOutlined style={{ color: "#8d8676" }} />
                        <Text style={{ fontSize: 13 }}>
                          {materia.horasSemanales} horas semanales
                        </Text>
                      </div>

                      <div className="materia-comisiones-lista">
                        <Text type="secondary" style={{ fontSize: 12, display: "block", marginBottom: 4 }}>
                          Comisiones asignadas:
                        </Text>
                        <Space wrap size={[4, 4]}>
                          {materia.comisiones.map((com, idx) => (
                            <Tag key={idx} variant="outlined" color="default">
                              {com}
                            </Tag>
                          ))}
                        </Space>
                      </div>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>

            <Text className="materias-pie-pagina">
              AulaActiva · Sistema de gestión académica
            </Text>
          </Content>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
}