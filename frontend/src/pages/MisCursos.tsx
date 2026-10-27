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
  Row,
  Col,
  Input,
  Card,
  Badge,
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
  EnvironmentOutlined,
} from "@ant-design/icons";
import "dayjs/locale/es";
import locale from "antd/locale/es_ES";
import { clearSession, getSessionUser } from "../services/auth";
import { ROUTES } from "../constants/routes";
import "./MisCursos.css";

const { Sider, Header, Content } = Layout;
const { Title, Text } = Typography;

interface Curso {
  id: string;
  materia: string;
  comision: string;
  cuatrimestre: string;
  horario: string;
  aula: string;
  cantAlumnos: number;
  asistenciasPendientes: number;
}

const cursosMock: Curso[] = [
  {
    id: "bd-1k1",
    materia: "Bases de Datos",
    comision: "Comisión 1K1",
    cuatrimestre: "1º Cuatrimestre",
    horario: "Lunes y Miércoles 18:00 - 21:00 hs",
    aula: "Aula 302",
    cantAlumnos: 32,
    asistenciasPendientes: 1,
  },
  {
    id: "prog-2k1",
    materia: "Programación Web",
    comision: "Comisión 2K1",
    cuatrimestre: "1º Cuatrimestre",
    horario: "Martes y Jueves 14:00 - 17:00 hs",
    aula: "Lab Computación 2",
    cantAlumnos: 28,
    asistenciasPendientes: 1,
  },
  {
    id: "mat-101",
    materia: "Matemática Discreta",
    comision: "Comisión 101",
    cuatrimestre: "Annual",
    horario: "Jueves 08:00 - 11:00 hs",
    aula: "Aula 105",
    cantAlumnos: 35,
    asistenciasPendientes: 0,
  },
  {
    id: "bd-2k2",
    materia: "Bases de Datos",
    comision: "Comisión 2K2",
    cuatrimestre: "2º Cuatrimestre",
    horario: "Viernes 18:00 - 22:00 hs",
    aula: "Aula 204",
    cantAlumnos: 30,
    asistenciasPendientes: 0,
  },
];

export default function MisCursos() {
  const navigate = useNavigate();
  const usuario = getSessionUser();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [busqueda, setBusqueda] = useState("");

  const [messageApi, contextHolder] = message.useMessage();

  const nombreCompleto = usuario
    ? `${usuario.nombre} ${usuario.apellido}`
    : "Fernández";
  const iniciales = usuario
    ? `${usuario.nombre[0]}${usuario.apellido[0]}`
    : "PF";

  const cerrarSesion = () => {
    clearSession();
    navigate(ROUTES.LOGIN);
  };

  const irACargarAsistencia = (comisionId: string) => {
    navigate(ROUTES.PROFESOR_ASISTENCIA, {
      state: { comisionId },
    });
  };

  const cursosFiltrados = cursosMock.filter(
    (curso) =>
      curso.materia.toLowerCase().includes(busqueda.toLowerCase()) ||
      curso.comision.toLowerCase().includes(busqueda.toLowerCase())
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
      <Layout className="cursos-layout">
        <Sider
          width={238}
          theme="light"
          breakpoint="lg"
          collapsedWidth={0}
          trigger={null}
          className="cursos-sidebar"
          style={{ background: "#fff" }}
        >
          <div className="cursos-logo">
            <div className="cursos-logo-icon">
              <BookOutlined />
            </div>
            <span>AulaActiva</span>
          </div>

          <Text className="cursos-menu-label">MENÚ PRINCIPAL</Text>

            <Menu
            mode="inline"
            selectedKeys={["cursos"]}
            items={opcionesMenu}
            onClick={({ key }) => {
                if (key === "inicio") {
                navigate(ROUTES.PROFESOR_INICIO);
                return;
                }
                if (key === "asistencia") {
                navigate(ROUTES.PROFESOR_ASISTENCIA);
                return;
                }
                if (key === "cursos") {
                navigate(ROUTES.PROFESOR_CURSOS);
                return;
                }

                messageApi.info("Esta función estará disponible próximamente.");
            }}
            className="cursos-menu"
            />

          <div className="cursos-sidebar-bottom">
            <div className="cursos-ayuda">
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
          <Header className="cursos-header">
            <Button
              type="text"
              icon={<MenuOutlined />}
              className="cursos-menu-mobile"
              onClick={() => setMenuAbierto(!menuAbierto)}
            />

            <div className="cursos-header-right">
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

          <Content className="cursos-content">
            {/* ENCABEZADO Y BUSCADOR */}
            <div className="cursos-encabezado">
              <div>
                <Title level={2} style={{ margin: 0, color: "#26211a" }}>
                  Mis Cursos
                </Title>
                <Text type="secondary" style={{ fontSize: 14 }}>
                  Gestión y consulta de comisiones asignadas
                </Text>
              </div>

              <div className="cursos-acciones-header">
                <Input
                  placeholder="Buscar materia o comisión..."
                  prefix={<SearchOutlined style={{ color: "#9a9284" }} />}
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  style={{ width: 280, borderRadius: 8 }}
                  allowClear
                />
              </div>
            </div>

            {/* GRILLA DE TARJETAS DE CURSOS */}
            <Row gutter={[20, 20]}>
              {cursosFiltrados.map((curso) => (
                <Col xs={24} md={12} lg={12} key={curso.id}>
                  <Card className="curso-card" bordered={false}>
                    <div className="curso-card-header">
                      <div>
                        <Tag color="gold" style={{ borderRadius: 6, marginBottom: 6 }}>
                          {curso.cuatrimestre}
                        </Tag>
                        <Title level={4} style={{ margin: 0, color: "#26211a" }}>
                          {curso.materia}
                        </Title>
                        <Text strong style={{ color: "#8a6530", fontSize: 13 }}>
                          {curso.comision}
                        </Text>
                      </div>

                      {curso.asistenciasPendientes > 0 && (
                        <Badge
                          count="Asistencia pendiente"
                          style={{
                            backgroundColor: "#fbf1e0",
                            color: "#bc9150",
                            fontWeight: 600,
                            borderRadius: 6,
                            border: "1px solid #e5d4b8",
                            boxShadow: "none",
                          }}
                        />
                      )}
                    </div>

                    <div className="curso-card-body">
                      <Space direction="vertical" size={8} style={{ width: "100%" }}>
                        <div className="curso-info-item">
                          <ClockCircleOutlined className="curso-info-icon" />
                          <Text style={{ fontSize: 13 }}>{curso.horario}</Text>
                        </div>
                        <div className="curso-info-item">
                          <EnvironmentOutlined className="curso-info-icon" />
                          <Text style={{ fontSize: 13 }}>{curso.aula}</Text>
                        </div>
                        <div className="curso-info-item">
                          <TeamOutlined className="curso-info-icon" />
                          <Text style={{ fontSize: 13 }}>
                            {curso.cantAlumnos} Alumnos inscriptos
                          </Text>
                        </div>
                      </Space>
                    </div>

                    <div className="curso-card-footer">
                      <Button
                        type="default"
                        size="middle"
                        onClick={() =>
                          messageApi.info("Lista de alumnos disponible próximamente.")
                        }
                        style={{ borderRadius: 8 }}
                      >
                        Ver alumnos
                      </Button>
                      <Button
                        type="primary"
                        size="middle"
                        icon={<CalendarOutlined />}
                        onClick={() => irACargarAsistencia(curso.id)}
                        style={{ borderRadius: 8 }}
                      >
                        Cargar Asistencia
                      </Button>
                    </div>
                  </Card>
                </Col>
              ))}

              {cursosFiltrados.length === 0 && (
                <Col xs={24}>
                  <div className="cursos-empty">
                    <Text type="secondary">
                      No se encontraron cursos que coincidan con la búsqueda.
                    </Text>
                  </div>
                </Col>
              )}
            </Row>

            <Text className="cursos-pie-pagina">
              AulaActiva · Sistema de gestión académica
            </Text>
          </Content>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
}