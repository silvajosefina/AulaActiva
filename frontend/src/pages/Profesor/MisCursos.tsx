import { useEffect, useState } from "react";
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
  Drawer,
  Spin,
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
import { clearSession, getSessionUser } from "../../services/auth";
import { getCursosDocente } from "../../services/docenteService";
import type { CursoDocente } from "../../services/docenteService";
import { ROUTES } from "../../constants/routes";
import "./MisCursos.css";

const { Header, Content, Sider } = Layout;
const { Title, Text } = Typography;

export default function MisCursos() {
  const navigate = useNavigate();
  const usuario = getSessionUser();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [cursos, setCursos] = useState<CursoDocente[]>([]);
  const [loading, setLoading] = useState(true);

  const [messageApi, contextHolder] = message.useMessage();

  const nombreCompleto = usuario
    ? `${usuario.nombre} ${usuario.apellido}`
    : "Docente";
  const iniciales = usuario
    ? `${usuario.nombre[0]}${usuario.apellido[0]}`
    : "DF";

  useEffect(() => {
    getCursosDocente()
      .then((data) => {
        setCursos(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        messageApi.error("No se pudieron cargar los cursos asignados.");
        setLoading(false);
      });
  }, [messageApi]);

  const cerrarSesion = () => {
    clearSession();
    navigate(ROUTES.LOGIN);
  };

  const irACargarAsistencia = (idCurso: number) => {
    navigate(ROUTES.PROFESOR_ASISTENCIA, {
      state: { comisionId: idCurso.toString() },
    });
  };

  const cursosFiltrados = cursos.filter(
    (curso) =>
      curso.materia.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      curso.comision.toLowerCase().includes(busqueda.toLowerCase()) ||
      curso.materia.carrera.toLowerCase().includes(busqueda.toLowerCase())
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
      if (key === "salir") {
        cerrarSesion();
        return;
      }
      if (key === "perfil") {
        navigate("/profesor/perfil");
      }
    },
  };

  const rutasMenu: Record<string, string> = {
    inicio: ROUTES.PROFESOR_INICIO,
    asistencia: ROUTES.PROFESOR_ASISTENCIA,
    cursos: ROUTES.PROFESOR_CURSOS,
    alumnos: ROUTES.PROFESOR_ALUMNOS,
    materias: ROUTES.PROFESOR_MATERIAS,
  };

  const contenidoMenu = (
    <>
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
          setMenuAbierto(false);
          const ruta = rutasMenu[key];
          if (ruta) {
            navigate(ruta);
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
    </>
  );

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
          {contenidoMenu}
        </Sider>

        <Drawer
          placement="left"
          size={260}
          open={menuAbierto}
          onClose={() => setMenuAbierto(false)}
          closable={false}
          styles={{ body: { padding: 0, display: "flex", flexDirection: "column" } }}
        >
          {contenidoMenu}
        </Drawer>

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

            {loading ? (
              <div style={{ textAlign: "center", padding: "60px 0" }}>
                <Spin size="large" />
              </div>
            ) : (
              <Row gutter={[20, 20]}>
                {cursosFiltrados.map((curso) => {
                  const horarioTexto = curso.horarios.length > 0
                    ? curso.horarios.map(h => `${h.dia} ${h.horaInicio} - ${h.horaFin} hs`).join(" | ")
                    : "Horario a coordinar";

                  const pendienteAsistencia = curso.tieneClaseHoy && !curso.asistenciaHoyCargada;

                  return (
                    <Col xs={24} md={12} lg={12} key={curso.idCurso}>
                      <Card className="curso-card" variant="borderless">
                        <div className="curso-card-header">
                          <div>
                            <Tag color="gold" style={{ borderRadius: 6, marginBottom: 6 }}>
                              {curso.periodo} ({curso.anio})
                            </Tag>
                            <Title level={4} style={{ margin: 0, color: "#26211a" }}>
                              {curso.materia.nombre}
                            </Title>
                            <Text strong style={{ color: "#8a6530", fontSize: 13 }}>
                              Comisión {curso.comision}
                            </Text>
                          </div>

                          {pendienteAsistencia && (
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
                          <Space orientation="vertical" size={8} style={{ width: "100%" }}>
                            <div className="curso-info-item">
                              <ClockCircleOutlined className="curso-info-icon" />
                              <Text style={{ fontSize: 13 }}>{horarioTexto}</Text>
                            </div>
                            <div className="curso-info-item">
                              <EnvironmentOutlined className="curso-info-icon" />
                              <Text style={{ fontSize: 13 }}>{curso.materia.carrera}</Text>
                            </div>
                            <div className="curso-info-item">
                              <TeamOutlined className="curso-info-icon" />
                              <Text style={{ fontSize: 13 }}>
                                {curso.cantidadAlumnos} Alumnos inscriptos
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
                            onClick={() => irACargarAsistencia(curso.idCurso)}
                            style={{ borderRadius: 8 }}
                          >
                            Cargar Asistencia
                          </Button>
                        </div>
                      </Card>
                    </Col>
                  );
                })}

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
            )}

            <Text className="cursos-pie-pagina">
              AulaActiva · Sistema de gestión académica
            </Text>
          </Content>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
}