import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Layout,
  Menu,
  Typography,
  Select,
  DatePicker,
  Input,
  Button,
  Table,
  Tag,
  Radio,
  Space,
  Avatar,
  Dropdown,
  ConfigProvider,
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
  SearchOutlined,
  SaveOutlined,
  CheckCircleFilled,
  CloseCircleOutlined,
  ClockCircleOutlined,
  InfoCircleOutlined,
  DownOutlined,
  MenuOutlined,
} from "@ant-design/icons";
import dayjs, { type Dayjs } from "dayjs";
import "dayjs/locale/es";
import locale from "antd/locale/es_ES";
import { clearSession, getSessionUser } from "../services/auth";
import { ROUTES } from "../constants/routes";
import "./CargaAsistencia.css";

const { Sider, Header, Content } = Layout;
const { Title, Text } = Typography;

type EstadoAsistencia = "P" | "A" | "T" | "J";

interface Alumno {
  id: number;
  legajo: string;
  nombre: string;
  apellido: string;
  estado?: EstadoAsistencia;
}

const alumnosIniciales: Alumno[] = [
  { id: 1, legajo: "1024", nombre: "Lucía", apellido: "Fernández" },
  { id: 2, legajo: "1031", nombre: "Mateo", apellido: "González" },
  { id: 3, legajo: "1045", nombre: "Sofía", apellido: "Martínez" },
  { id: 4, legajo: "1052", nombre: "Tomás", apellido: "Rodríguez" },
  { id: 5, legajo: "1068", nombre: "Valentina", apellido: "López" },
  { id: 6, legajo: "1080", nombre: "Benjamín", apellido: "Díaz" },
];

const colorEstado: Record<EstadoAsistencia, string> = {
  P: "success",
  A: "error",
  T: "warning",
  J: "processing",
};

const textoEstado: Record<EstadoAsistencia, string> = {
  P: "Presente",
  A: "Ausente",
  T: "Tarde",
  J: "Justificada",
};

export default function CargaAsistencia() {
  const navigate = useNavigate();
  const usuario = getSessionUser();
  const [materia, setMateria] = useState("bd");
  const [fecha, setFecha] = useState<Dayjs | null>(dayjs());
  const [busqueda, setBusqueda] = useState("");
  const [alumnos, setAlumnos] = useState<Alumno[]>(alumnosIniciales);
  const [menuAbierto, setMenuAbierto] = useState(false);
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

  const presentes = alumnos.filter((a) => a.estado === "P").length;
  const ausentes = alumnos.filter((a) => a.estado === "A").length;
  const tarde = alumnos.filter((a) => a.estado === "T").length;
  const justificadas = alumnos.filter((a) => a.estado === "J").length;

  const pendientes = alumnos.filter((a) => !a.estado).length;

  const alumnosFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    return alumnos.filter((a) =>
      `${a.nombre} ${a.apellido} ${a.legajo}`
        .toLowerCase()
        .includes(texto)
    );
  }, [alumnos, busqueda]);

  const actualizarEstado = (
    id: number,
    estado: EstadoAsistencia
  ) => {
    setAlumnos((actuales) =>
      actuales.map((a) =>
        a.id === id ? { ...a, estado } : a
      )
    );
  };

  const marcarTodos = (estado: EstadoAsistencia) => {
    setAlumnos((actuales) =>
      actuales.map((a) => ({ ...a, estado }))
    );
  };

  const guardarAsistencia = () => {
    if (!materia || !fecha) {
      messageApi.warning("Seleccioná una materia y una fecha.");
      return;
    }

    if (pendientes > 0) {
      messageApi.warning(
        `Todavía falta registrar a ${pendientes} alumno(s).`
      );
      return;
    }

    const registro = {
      materia,
      fecha: fecha.format("YYYY-MM-DD"),
      asistencias: alumnos.map((a) => ({
        idAlumno: a.id,
        legajo: a.legajo,
        estado: a.estado,
      })),
    };

    console.log("Registro de asistencia:", registro);

    messageApi.success(
      "Validación completada. Falta conectar el guardado con el backend."
    );
  };

  const columnas: ColumnsType<Alumno> = [
    {
      title: "ALUMNO",
      key: "alumno",
      render: (_, alumno) => (
        <Space size={12}>
          <Avatar
            size={40}
            style={{
              background: "#f1e4cd",
              color: "#8a6530",
              fontWeight: 600,
              fontSize: 12,
            }}
          >
            {alumno.nombre[0]}
            {alumno.apellido[0]}
          </Avatar>

          <div>
            <Text strong style={{ color: "#26211a" }}>
              {alumno.nombre} {alumno.apellido}
            </Text>
            <br />
            <Text style={{ color: "#9a9284", fontSize: 12 }}>
              Legajo {alumno.legajo}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: "ESTADO DE ASISTENCIA",
      key: "estado",
      width: 480,
      render: (_, alumno) => (
        <Radio.Group
          value={alumno.estado}
          onChange={(e) =>
            actualizarEstado(alumno.id, e.target.value)
          }
          optionType="button"
          buttonStyle="solid"
          className="asistencia-opciones"
        >
          <Radio.Button value="P">
            <CheckCircleFilled /> P
          </Radio.Button>
          <Radio.Button value="A">
            <CloseCircleOutlined /> A
          </Radio.Button>
          <Radio.Button value="T">
            <ClockCircleOutlined /> T
          </Radio.Button>
          <Radio.Button value="J">
            <InfoCircleOutlined /> J
          </Radio.Button>
        </Radio.Group>
      ),
    },
    {
      title: "REGISTRO",
      key: "registro",
      align: "center",
      width: 140,
      render: (_, alumno) =>
        alumno.estado ? (
          <Tag
            variant="filled"
            color={colorEstado[alumno.estado]}
            style={{ borderRadius: 6, padding: "4px 10px" }}
          >
            {textoEstado[alumno.estado]}
          </Tag>
        ) : (
          <Text style={{ color: "#a2a9a3", fontSize: 12 }}>
            Pendiente
          </Text>
        ),
    },
  ];

  const opcionesMenu = [
    {
      key: "inicio",
      icon: <HomeOutlined />,
      label: "Inicio",
    },
    {
      key: "cursos",
      icon: <ReadOutlined />,
      label: "Mis cursos",
    },
    {
      key: "asistencia",
      icon: <CalendarOutlined />,
      label: "Cargar asistencia",
    },
    {
      key: "alumnos",
      icon: <TeamOutlined />,
      label: "Mis alumnos",
    },
    {
      key: "materias",
      icon: <BookOutlined />,
      label: "Materias",
    },
  ];

  const menuUsuario = {
    items: [
      {
        key: "perfil",
        label: "Mi perfil",
        icon: <UserOutlined />,
      },
      {
        key: "salir",
        label: "Cerrar sesión",
        icon: <LogoutOutlined />,
      },
    ],
    onClick: ({ key }: { key: string }) => {
      if (key === "salir") {
        cerrarSesion();
        return;
      }
      messageApi.info("Esta función estará disponible próximamente.");
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
          Table: {
            headerBg: "#f8f6f1",
            headerColor: "#8d8676",
            rowHoverBg: "#f8f6f1",
            borderColor: "#f0ece0",
          },
        },
      }}
    >
      {contextHolder}

      <Layout className="asistencia-layout">
        <Sider
          width={238}
          theme="light"
          breakpoint="lg"
          collapsedWidth={0}
          trigger={null}
          className="asistencia-sidebar"
          style={{ background: "#fff" }}
        >
          <div className="asistencia-logo">
            <div className="asistencia-logo-icon">
              <BookOutlined />
            </div>
            <span>AulaActiva</span>
          </div>

          <Text className="asistencia-menu-label">
            MENÚ PRINCIPAL
          </Text>

          <Menu
            mode="inline"
            inlineIndent={16}
            selectedKeys={["asistencia"]} 
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
              if (key === "alumnos") { 
                navigate(ROUTES.PROFESOR_ALUMNOS);
                return;
              }

              messageApi.info("Esta función estará disponible próximamente.");
            }}
            className="asistencia-menu"
          />

          <div className="asistencia-sidebar-bottom">
            <div className="asistencia-ayuda">
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
          <Header className="asistencia-header">
            <Button
              type="text"
              icon={<MenuOutlined />}
              className="asistencia-menu-mobile"
              onClick={() => setMenuAbierto(!menuAbierto)}
            />

            <div className="asistencia-header-right">
              <Avatar
                style={{
                  background: "#f1e4cd",
                  color: "#8a6530",
                }}
              >
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

          <Content className="asistencia-content">
            <div className="asistencia-titulo">
              <Text className="asistencia-migas">
                Inicio / Mis cursos /{" "}
                <span>Cargar asistencia</span>
              </Text>

              <Title level={2} style={{ margin: "12px 0 4px" }}>
                Cargar asistencia
              </Title>

              <Text type="secondary">
                Registrá la asistencia de los alumnos de tu cursada.
              </Text>
            </div>

            <section className="asistencia-filtros">
              <div className="asistencia-campo">
                <Text strong>Materia</Text>
                <Select
                  value={materia}
                  onChange={setMateria}
                  style={{ width: "100%", marginTop: 8 }}
                  options={[
                    { value: "bd", label: "Bases de Datos" },
                    {
                      value: "programacion",
                      label: "Programación",
                    },
                    {
                      value: "matematica",
                      label: "Matemática",
                    },
                  ]}
                  suffixIcon={<BookOutlined />}
                />
              </div>

              <div className="asistencia-campo">
                <Text strong>Fecha de cursado</Text>
                <DatePicker
                  value={fecha}
                  onChange={setFecha}
                  format="DD/MM/YYYY"
                  allowClear={false}
                  style={{ width: "100%", marginTop: 8 }}
                  suffixIcon={<CalendarOutlined />}
                />
              </div>

              <Button
                type="primary"
                icon={<SaveOutlined />}
                className="asistencia-guardar-top"
                onClick={guardarAsistencia}
              >
                Guardar asistencia
              </Button>
            </section>

            <div className="asistencia-resumen">
              <div className="asistencia-resumen-item">
                <div className="asistencia-resumen-icon neutro">
                  <TeamOutlined />
                </div>
                <div>
                  <Text type="secondary">Total de alumnos</Text>
                  <Title level={3} style={{ margin: 0 }}>{alumnos.length}</Title>
                </div>
              </div>

              <div className="asistencia-resumen-item">
                <div className="asistencia-resumen-icon verde">
                  <CheckCircleFilled />
                </div>
                <div>
                  <Text type="secondary">Presentes (P)</Text>
                  <Title level={3} style={{ margin: 0, color: "#39805a" }}>
                    {presentes}
                  </Title>
                </div>
              </div>

              <div className="asistencia-resumen-item">
                <div className="asistencia-resumen-icon rojo">
                  <CloseCircleOutlined />
                </div>
                <div>
                  <Text type="secondary">Ausentes (A)</Text>
                  <Title level={3} style={{ margin: 0, color: "#d75b57" }}>
                    {ausentes}
                  </Title>
                </div>
              </div>

              <div className="asistencia-resumen-item">
                <div className="asistencia-resumen-icon amarillo">
                  <ClockCircleOutlined />
                </div>
                <div>
                  <Text type="secondary">Llegadas tarde (T)</Text>
                  <Title level={3} style={{ margin: 0, color: "#c48a28" }}>
                    {tarde}
                  </Title>
                </div>
              </div>

              <div className="asistencia-resumen-item">
                <div className="asistencia-resumen-icon azul" style={{ color: "#1677ff", background: "#e6f4ff" }}>
                  <InfoCircleOutlined />
                </div>
                <div>
                  <Text type="secondary">Justificadas (J)</Text>
                  <Title level={3} style={{ margin: 0, color: "#1677ff" }}>
                    {justificadas}
                  </Title>
                </div>
              </div>
            </div>

            <section className="asistencia-tabla">
              <div className="asistencia-tabla-header">
                <div>
                  <Title level={4} style={{ margin: 0 }}>
                    Lista de alumnos
                  </Title>
                  <Text type="secondary">
                    Seleccioná el estado de cada alumno.
                  </Text>
                </div>

                <Space wrap>
                  <Input
                    placeholder="Buscar alumno o legajo..."
                    prefix={<SearchOutlined />}
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    allowClear
                    style={{ width: 240 }}
                  />

                  <Dropdown
                    menu={{
                      items: [
                        {
                          key: "P",
                          label: "Todos Presentes (P)",
                        },
                        {
                          key: "A",
                          label: "Todos Ausentes (A)",
                        },
                        {
                          key: "T",
                          label: "Todos Tarde (T)",
                        },
                        {
                          key: "J",
                          label: "Todos Justificados (J)",
                        },
                      ],
                      onClick: ({ key }) =>
                        marcarTodos(key as EstadoAsistencia),
                    }}
                    trigger={["click"]}
                  >
                    <Button>
                      Marcar todos <DownOutlined />
                    </Button>
                  </Dropdown>
                </Space>
              </div>

              <Table<Alumno>
                rowKey="id"
                columns={columnas}
                dataSource={alumnosFiltrados}
                pagination={false}
                scroll={{ x: 850 }}
                className="asistencia-table"
                locale={{
                  emptyText: "No se encontraron alumnos.",
                }}
              />

              <div className="asistencia-pie-tabla">
                <Text type="secondary">
                  {alumnos.length} alumnos · {pendientes} pendientes de
                  registrar
                </Text>

                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  onClick={guardarAsistencia}
                >
                  Guardar asistencia
                </Button>
              </div>
            </section>

            <Text className="asistencia-pie-pagina">
              AulaActiva · Sistema de gestión académica
            </Text>
          </Content>
        </Layout>
      </Layout>

    </ConfigProvider>
  );
}