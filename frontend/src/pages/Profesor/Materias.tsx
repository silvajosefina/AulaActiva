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
  Card,
  Row,
  Col,
  Input,
  Drawer,
  Spin,
  Alert,
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
} from "@ant-design/icons";
import axios from "axios";
import "dayjs/locale/es";
import locale from "antd/locale/es_ES";
import { clearSession, getSessionUser } from "../../services/auth";
import { ROUTES } from "../../constants/routes";
import { getMateriasDocente, type MateriaDocente } from "../../services/docenteService";
import "./Materias.css";

const { Sider, Header, Content } = Layout;
const { Title, Text } = Typography;

function describirNiveles(materia: MateriaDocente): string {
  return [...new Set(materia.cursos.map((curso) => curso.anio))]
    .sort((a, b) => a - b)
    .map((anio) => `${anio}º año`)
    .join(" / ");
}

export default function Materias() {
  const navigate = useNavigate();
  const usuario = getSessionUser();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [materias, setMaterias] = useState<MateriaDocente[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [intento, setIntento] = useState(0);

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

  useEffect(() => {
    let activo = true;
    getMateriasDocente()
      .then((datos) => {
        if (activo) setMaterias(datos);
      })
      .catch((err) => {
        if (!activo) return;
        if (axios.isAxiosError(err) && err.response?.status === 401) {
          clearSession();
          navigate(ROUTES.LOGIN);
          return;
        }
        setError(
          axios.isAxiosError(err) && !err.response
            ? "No pudimos conectarnos con el servidor. Revisá que el backend esté levantado."
            : "No pudimos cargar tus materias. Intentá de nuevo."
        );
      })
      .finally(() => {
        if (activo) setCargando(false);
      });
    return () => {
      activo = false;
    };
  }, [intento, navigate]);

  const reintentar = () => {
    setCargando(true);
    setError(null);
    setIntento((n) => n + 1);
  };

  const textoBuscado = busqueda.trim().toLowerCase();
  const materiasFiltradas = materias.filter(
    (materia) =>
      materia.nombre.toLowerCase().includes(textoBuscado) ||
      materia.cursos.some((curso) => curso.comision.toLowerCase().includes(textoBuscado))
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
          setMenuAbierto(false);
          const ruta = rutasMenu[key];
          if (ruta) navigate(ruta);
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
            <div className="materias-encabezado">
              <div>
                <Title level={2} style={{ margin: 0, color: "#26211a" }}>
                  Materias a Cargo
                </Title>
                <Text type="secondary" style={{ fontSize: 14 }}>
                  Materias y comisiones asignadas
                </Text>
              </div>

              <Input
                placeholder="Buscar materia o comisión..."
                prefix={<SearchOutlined style={{ color: "#9a9284" }} />}
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                style={{ width: 260, borderRadius: 8 }}
                allowClear
              />
            </div>

            {cargando && (
              <div style={{ display: "flex", justifyContent: "center", padding: 48 }}>
                <Spin />
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

            {!cargando && !error && (
              <Row gutter={[20, 20]}>
                {materiasFiltradas.map((materia) => (
                  <Col xs={24} md={12} lg={8} key={materia.idMateria}>
                    <Card variant="borderless" className="materia-card">
                      <div className="materia-card-top">
                        <Tag color="gold" style={{ borderRadius: 6 }}>
                          {describirNiveles(materia)}
                        </Tag>
                      </div>

                      <Title level={4} style={{ margin: "12px 0 4px" }}>
                        {materia.nombre}
                      </Title>
                      <Text type="secondary" style={{ fontSize: 13 }}>
                        {materia.carrera}
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
                            {materia.cursos.map((curso) => (
                              <Tag key={curso.idCurso} variant="outlined" color="default">
                                Comisión {curso.comision}
                              </Tag>
                            ))}
                          </Space>
                        </div>
                      </div>
                    </Card>
                  </Col>
                ))}

                {materiasFiltradas.length === 0 && (
                  <Col xs={24}>
                    <Text type="secondary">
                      {materias.length === 0
                        ? "Todavía no tenés materias asignadas."
                        : "No se encontraron materias que coincidan con la búsqueda."}
                    </Text>
                  </Col>
                )}
              </Row>
            )}

            <Text className="materias-pie-pagina">
              AulaActiva · Sistema de gestión académica
            </Text>
          </Content>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
}