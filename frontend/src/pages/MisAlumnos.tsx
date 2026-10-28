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
  Input,
  Select,
  Table,
  Progress,
  Card,
  message,
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
import { clearSession, getSessionUser } from "../services/auth";
import { ROUTES } from "../constants/routes";
import "./MisAlumnos.css";

const { Sider, Header, Content } = Layout;
const { Title, Text } = Typography;

interface Alumno {
  key: string;
  legajo: string;
  nombre: string;
  apellido: string;
  email: string;
  materia: string;
  comision: string;
  asistenciaPorcentaje: number;
  estado: "Regular" | "Promocionado" | "En riesgo";
}

const alumnosMock: Alumno[] = [
  {
    key: "1",
    legajo: "48201",
    nombre: "Sofía",
    apellido: "Martínez",
    email: "sofia.martinez@mi.unc.edu.ar",
    materia: "Bases de Datos",
    comision: "Comisión 1K1",
    asistenciaPorcentaje: 92,
    estado: "Promocionado",
  },
  {
    key: "2",
    legajo: "48102",
    nombre: "Mateo",
    apellido: "González",
    email: "mateo.gonzalez@mi.unc.edu.ar",
    materia: "Bases de Datos",
    comision: "Comisión 1K1",
    asistenciaPorcentaje: 78,
    estado: "Regular",
  },
  {
    key: "3",
    legajo: "48344",
    nombre: "Valentina",
    apellido: "Rodríguez",
    email: "valen.rodriguez@mi.unc.edu.ar",
    materia: "Programación Web",
    comision: "Comisión 2K1",
    asistenciaPorcentaje: 88,
    estado: "Regular",
  },
  {
    key: "4",
    legajo: "47990",
    nombre: "Lucas",
    apellido: "Fernández",
    email: "lucas.fernandez@mi.unc.edu.ar",
    materia: "Programación Web",
    comision: "Comisión 2K1",
    asistenciaPorcentaje: 65,
    estado: "En riesgo",
  },
  {
    key: "5",
    legajo: "48512",
    nombre: "Camila",
    apellido: "Gómez",
    email: "camila.gomez@mi.unc.edu.ar",
    materia: "Matemática Discreta",
    comision: "Comisión 101",
    asistenciaPorcentaje: 95,
    estado: "Promocionado",
  },
];

export default function MisAlumnos() {
  const navigate = useNavigate();
  const usuario = getSessionUser();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [comisionFiltro, setComisionFiltro] = useState<string>("todas");

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

  const alumnosFiltrados = alumnosMock.filter((alumno) => {
    const coincideBusqueda =
      alumno.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      alumno.apellido.toLowerCase().includes(busqueda.toLowerCase()) ||
      alumno.legajo.includes(busqueda);

    const coincideComision =
      comisionFiltro === "todas" || alumno.comision === comisionFiltro;

    return coincideBusqueda && coincideComision;
  });

const columnas: ColumnsType<Alumno> = [
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
      dataIndex: "legajo",
      key: "legajo",
      width: 110,
      render: (legajo) => <Text code>{legajo}</Text>,
    },
    {
      title: "Materia / Comisión",
      key: "materiaComision",
      render: (_, record) => (
        <div>
          <Text strong style={{ fontSize: 13, display: "block" }}>
            {record.materia}
          </Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.comision}
          </Text>
        </div>
      ),
    },
    {
      title: "Asistencia",
      dataIndex: "asistenciaPorcentaje",
      key: "asistenciaPorcentaje",
      width: 200,
      render: (porcentaje) => {
        let color = "#bc9150";
        if (porcentaje < 75) color = "#ff4d4f";
        else if (porcentaje >= 90) color = "#52c41a";

        return (
          <div style={{ paddingRight: 12 }}>
            <Progress
              percent={porcentaje}
              size="small"
              strokeColor={color}
              format={(p) => `${p}%`}
            />
          </div>
        );
      },
    },
    {
      title: "Estado",
      dataIndex: "estado",
      key: "estado",
      width: 140,
      render: (estado: Alumno["estado"]) => {
        let colorTag = "default";
        if (estado === "Promocionado") colorTag = "green";
        if (estado === "Regular") colorTag = "gold";
        if (estado === "En riesgo") colorTag = "red";

        return <Tag color={colorTag}>{estado}</Tag>;
      },
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
              if (key === "inicio") return navigate(ROUTES.PROFESOR_INICIO);
              if (key === "cursos") return navigate(ROUTES.PROFESOR_CURSOS);
              if (key === "asistencia") return navigate(ROUTES.PROFESOR_ASISTENCIA);
              if (key === "alumnos") return;

              messageApi.info("Esta función estará disponible próximamente.");
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
        </Sider>

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
            {/* ENCABEZADO */}
            <div className="alumnos-encabezado">
              <div>
                <Title level={2} style={{ margin: 0, color: "#26211a" }}>
                  Mis Alumnos
                </Title>
                <Text type="secondary" style={{ fontSize: 14 }}>
                  Listado y seguimiento académico por comisión
                </Text>
              </div>

              {/* FILTROS Y BÚSQUEDA */}
              <div className="alumnos-acciones-header">
                <Select
                  defaultValue="todas"
                  style={{ width: 180 }}
                  onChange={(val) => setComisionFiltro(val)}
                  suffixIcon={<FilterOutlined style={{ color: "#9a9284" }} />}
                  options={[
                    { value: "todas", label: "Todas las comisiones" },
                    { value: "Comisión 1K1", label: "Comisión 1K1" },
                    { value: "Comisión 2K1", label: "Comisión 2K1" },
                    { value: "Comisión 101", label: "Comisión 101" },
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

            {/* TABLA DE ALUMNOS */}
            <Card className="alumnos-card-tabla" bordered={false}>
              <Table
                columns={columnas}
                dataSource={alumnosFiltrados}
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