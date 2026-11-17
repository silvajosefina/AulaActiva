import { useState, useEffect } from "react";
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
  Input,
  Select,
  Table,
  Card,
  message,
  Drawer,
} from "antd";
import type { ColumnsType } from "antd/es/table";
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
  FilterOutlined,
} from "@ant-design/icons";
import "dayjs/locale/es";
import locale from "antd/locale/es_ES";
import { clearSession, getSessionUser } from "../../services/auth";
import { getAlumnosDocente, type AlumnoDocente } from "../../services/docenteService";
import { ROUTES } from "../../constants/routes";
import "./MisAlumnos.css";

const { Sider, Header, Content } = Layout;
const { Title, Text } = Typography;

export default function MisAlumnos() {
  const navigate = useNavigate();
  const usuario = getSessionUser();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [materiaFiltro, setMateriaFiltro] = useState<string>("todas");
  const [alumnos, setAlumnos] = useState<AlumnoDocente[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);

  const [messageApi, contextHolder] = message.useMessage();

  const nombreCompleto = usuario
    ? `${usuario.nombre} ${usuario.apellido}`
    : "Docente";
  const iniciales = usuario
    ? `${usuario.nombre[0]}${usuario.apellido[0]}`
    : "DOC";

  useEffect(() => {
    const cargarAlumnos = async () => {
      try {
        setCargando(true);
        const data = await getAlumnosDocente();
        setAlumnos(data);
      } catch (error) {
        console.error("Error al cargar los alumnos:", error);
        messageApi.error("No se pudieron cargar los alumnos del servidor.");
      } finally {
        setCargando(false);
      }
    };

    cargarAlumnos();
  }, [messageApi]);

  const cerrarSesion = () => {
    clearSession();
    navigate(ROUTES.LOGIN);
  };

  // Filtrado de alumnos por nombre, apellido, legajo o materia
  const alumnosFiltrados = alumnos.filter((alumno) => {
    const coincideBusqueda =
      alumno.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      alumno.apellido.toLowerCase().includes(busqueda.toLowerCase()) ||
      alumno.legajoAlumno.toString().includes(busqueda);

    const coincideMateria =
      materiaFiltro === "todas" ||
      alumno.cursos.some((c) => c.materia === materiaFiltro);

    return coincideBusqueda && coincideMateria;
  });

  const columnas: ColumnsType<AlumnoDocente> = [
    {
      title: "Alumno",
      dataIndex: "nombre",
      key: "nombre",
      render: (_, record) => (
        <Space size="middle">
          <Avatar style={{ backgroundColor: "#f1e4cd", color: "#8a6530" }}>
            {record.nombre[0]}
            {record.apellido[0]}
          </Avatar>
          <div>
            <Text strong style={{ display: "block" }}>
              {record.apellido}, {record.nombre}
            </Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.email}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: "Legajo",
      dataIndex: "legajoAlumno",
      key: "legajoAlumno",
      width: 110,
      render: (legajo) => <Text code>{legajo}</Text>,
    },
    {
      title: "Materias y Comisiones",
      key: "cursos",
      render: (_, record) => (
        <Space direction="vertical" size={2}>
          {record.cursos.map((curso, idx) => (
            <div key={idx}>
              <Text strong style={{ fontSize: 13 }}>
                {curso.materia}
              </Text>{" "}
              <Text type="secondary" style={{ fontSize: 12 }}>
                ({curso.comision} - {curso.periodo})
              </Text>
            </div>
          ))}
        </Space>
      ),
    },
    {
      title: "Estado Inscripto",
      key: "estado",
      width: 140,
      render: () => <Tag color="gold">Regular</Tag>,
    },
  ];

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
      <div className="alumnos-logo">
        <div className="alumnos-logo-icon">
          <BookOutlined />
        </div>
        <span>AulaActiva</span>
      </div>

      <Text className="alumnos-menu-label">MENÚ PRINCIPAL</Text>

      <Menu
        mode="inline"
        selectedKeys={["alumnos"]}
        items={opcionesMenu}
        onClick={({ key }) => {
          setMenuAbierto(false);
          const ruta = rutasMenu[key];
          if (ruta) navigate(ruta);
        }}
        className="alumnos-menu"
      />

      <div className="alumnos-sidebar-bottom">
        <div className="alumnos-ayuda">
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
      <Layout className="alumnos-layout">
        <Sider
          width={238}
          theme="light"
          breakpoint="lg"
          collapsedWidth={0}
          trigger={null}
          className="alumnos-sidebar"
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
          <Header className="alumnos-header">
            <Button
              type="text"
              icon={<MenuOutlined />}
              className="alumnos-menu-mobile"
              onClick={() => setMenuAbierto(!menuAbierto)}
            />

            <div className="alumnos-header-right">
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

          <Content className="alumnos-content">
            <div className="alumnos-encabezado">
              <div>
                <Title level={2} style={{ margin: 0, color: "#26211a" }}>
                  Mis Alumnos
                </Title>
                <Text type="secondary" style={{ fontSize: 14 }}>
                  Listado y seguimiento de estudiantes inscriptos en tus cursos
                </Text>
              </div>

              <div className="alumnos-acciones-header">
                <Select
                  defaultValue="todas"
                  style={{ width: 200 }}
                  onChange={(val) => setMateriaFiltro(val)}
                  suffixIcon={<FilterOutlined style={{ color: "#9a9284" }} />}
                  options={[
                    { value: "todas", label: "Todas las materias" },
                    // Podés agregar opciones dinámicas o fijas según prefieras
                  ]}
                />

                <Input
                  placeholder="Buscar por nombre o legajo..."
                  prefix={<SearchOutlined style={{ color: "#9a9284" }} />}
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  style={{ width: 260, borderRadius: 8 }}
                  allowClear
                />
              </div>
            </div>

            <Card className="alumnos-card-tabla" variant="borderless">
              <Table
                columns={columnas}
                dataSource={alumnosFiltrados}
                rowKey="legajoAlumno"
                loading={cargando}
                pagination={{ pageSize: 6, showSizeChanger: false }}
                scroll={{ x: 600 }}
              />
            </Card>

            <Text className="alumnos-pie-pagina">
              AulaActiva · Sistema de gestión académica
            </Text>
          </Content>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
}