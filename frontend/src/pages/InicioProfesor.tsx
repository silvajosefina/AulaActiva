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
  Table,
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
  ArrowRightOutlined,
  ClockCircleOutlined,
  SearchOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import "dayjs/locale/es";
import locale from "antd/locale/es_ES";
import { clearSession, getSessionUser } from "../services/auth";
import { ROUTES } from "../constants/routes";
import "./InicioProfesor.css";

const { Sider, Header, Content } = Layout;
const { Title, Text } = Typography;

interface ProximaClase {
  id: number;
  materiaId: string;
  materia: string;
  comisionId: string;
  comision: string;
  horario: string;
  aula: string;
  alumnosCount: number;
  estadoAsistencia: "pendiente" | "registrada";
}

const proximasClasesMock: ProximaClase[] = [
  {
    id: 1,
    materiaId: "bd",
    materia: "Bases de Datos",
    comisionId: "bd-1k1",
    comision: "Comisión 1K1",
    horario: "Hoy, 18:00 - 21:00 hs",
    aula: "Aula 302",
    alumnosCount: 32,
    estadoAsistencia: "pendiente",
  },
  {
    id: 2,
    materiaId: "programacion",
    materia: "Programación Web",
    comisionId: "prog-2k1",
    comision: "Comisión 2K1",
    horario: "Mañana, 14:00 - 17:00 hs",
    aula: "Lab Computación 2",
    alumnosCount: 28,
    estadoAsistencia: "pendiente",
  },
  {
    id: 3,
    materiaId: "matematica",
    materia: "Matemática Discreta",
    comisionId: "mat-101",
    comision: "Comisión 101",
    horario: "Jueves 29, 08:00 - 11:00 hs",
    aula: "Aula 105",
    alumnosCount: 35,
    estadoAsistencia: "registrada",
  },
];

export default function InicioProfesor() {
  const navigate = useNavigate();
  const usuario = getSessionUser();
  const [menuAbierto, setMenuAbierto] = useState(false);

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

  const irACargarAsistencia = (materiaId?: string, comisionId?: string) => {
    navigate(ROUTES.PROFESOR_ASISTENCIA, {
      state: { materiaId, comisionId },
    });
  };

  const columnasClases: ColumnsType<ProximaClase> = [
    {
      title: "MATERIA Y COMISIÓN",
      key: "materia",
      render: (_, record) => (
        <div>
          <Text strong style={{ color: "#26211a", display: "block" }}>
            {record.materia}
          </Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.comision} · {record.aula}
          </Text>
        </div>
      ),
    },
    {
      title: "HORARIO",
      key: "horario",
      render: (_, record) => (
        <Space size={6}>
          <ClockCircleOutlined style={{ color: "#8d8676" }} />
          <Text style={{ fontSize: 13 }}>{record.horario}</Text>
        </Space>
      ),
    },
    {
      title: "ALUMNOS",
      key: "alumnos",
      align: "center",
      render: (_, record) => (
        <Text style={{ fontSize: 13, fontWeight: 500 }}>
          {record.alumnosCount} inscriptos
        </Text>
      ),
    },
    {
      title: "ESTADO / ACCIÓN",
      key: "accion",
      align: "right",
      render: (_, record) =>
        record.estadoAsistencia === "pendiente" ? (
          <Button
            type="primary"
            size="small"
            icon={<CalendarOutlined />}
            onClick={() => irACargarAsistencia(record.materiaId, record.comisionId)}
            style={{ borderRadius: 6 }}
          >
            Cargar asistencia
          </Button>
        ) : (
          <Tag icon={<CheckCircleOutlined />} color="success" style={{ borderRadius: 6, padding: "2px 8px" }}>
            Asistencia cargada
          </Tag>
        ),
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
          fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
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
      <Layout className="inicio-layout">
        <Sider
          width={238}
          theme="light"
          breakpoint="lg"
          collapsedWidth={0}
          trigger={null}
          className="inicio-sidebar"
          style={{ background: "#fff" }}
        >
          <div className="inicio-logo">
            <div className="inicio-logo-icon">
              <BookOutlined />
            </div>
            <span>AulaActiva</span>
          </div>

          <Text className="inicio-menu-label">MENÚ PRINCIPAL</Text>

          <Menu
            mode="inline"
            selectedKeys={["inicio"]}
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

              messageApi.info("Esta función estará disponible próximamente.");
            }}
            className="inicio-menu"
          />

          <div className="inicio-sidebar-bottom">
            <div className="inicio-ayuda">
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
          <Header className="inicio-header">
            <Button
              type="text"
              icon={<MenuOutlined />}
              className="inicio-menu-mobile"
              onClick={() => setMenuAbierto(!menuAbierto)}
            />

            <div className="inicio-header-right">
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

          <Content className="inicio-content">
            {/* SALUDO Y BIENVENIDA */}
            <div className="inicio-encabezado">
              <Title level={2} style={{ margin: 0, color: "#26211a" }}>
                ¡Buen día, Prof. {nombreCompleto.split(" ")[1] || nombreCompleto}!
              </Title>
              <Text type="secondary" style={{ fontSize: 14 }}>
                Este es el resumen de tu actividad académica para hoy.
              </Text>
            </div>

            {/* TARJETAS KPI DE RESUMEN */}
            <div className="inicio-kpi-grid">
              <div className="inicio-kpi-card">
                <div className="inicio-kpi-icon brown">
                  <BookOutlined />
                </div>
                <div>
                  <Text type="secondary">Materias asignadas</Text>
                  <Title level={3} style={{ margin: 0 }}>3</Title>
                </div>
              </div>

              <div className="inicio-kpi-card">
                <div className="inicio-kpi-icon brown">
                  <ReadOutlined />
                </div>
                <div>
                  <Text type="secondary">Cursos / Comisiones</Text>
                  <Title level={3} style={{ margin: 0 }}>4</Title>
                </div>
              </div>

              <div className="inicio-kpi-card">
                <div className="inicio-kpi-icon brown">
                  <TeamOutlined />
                </div>
                <div>
                  <Text type="secondary">Total de alumnos</Text>
                  <Title level={3} style={{ margin: 0 }}>95</Title>
                </div>
              </div>

              <div className="inicio-kpi-card destacado">
                <div className="inicio-kpi-icon orange">
                  <CalendarOutlined />
                </div>
                <div>
                  <Text type="secondary">Asistencias pendientes</Text>
                  <Title level={3} style={{ margin: 0, color: "#bc9150" }}>
                    2
                  </Title>
                </div>
              </div>
            </div>

            {/* SECCIÓN DE ACCESOS RÁPIDOS */}
            <div className="inicio-seccion-accesos">
              <Title level={4} style={{ margin: "0 0 14px", color: "#26211a" }}>
                Acciones rápidas
              </Title>
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={8}>
                  <div
                    className="inicio-acceso-card principal"
                    onClick={() => irACargarAsistencia()}
                  >
                    <CalendarOutlined className="inicio-acceso-icon" />
                    <div>
                      <Text strong style={{ display: "block", fontSize: 15, color: "#8a6530" }}>
                        Cargar asistencia
                      </Text>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Registrar la clase de hoy
                      </Text>
                    </div>
                    <ArrowRightOutlined className="inicio-acceso-arrow" />
                  </div>
                </Col>

                <Col xs={24} sm={8}>
                  <div
                    className="inicio-acceso-card"
                    onClick={() => messageApi.info("Esta función estará disponible próximamente.")}
                  >
                    <ReadOutlined className="inicio-acceso-icon" />
                    <div>
                      <Text strong style={{ display: "block", fontSize: 15 }}>
                        Mis cursos
                      </Text>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Ver comisiones y horarios
                      </Text>
                    </div>
                    <ArrowRightOutlined className="inicio-acceso-arrow" />
                  </div>
                </Col>

                <Col xs={24} sm={8}>
                  <div
                    className="inicio-acceso-card"
                    onClick={() => messageApi.info("Esta función estará disponible próximamente.")}
                  >
                    <SearchOutlined className="inicio-acceso-icon" />
                    <div>
                      <Text strong style={{ display: "block", fontSize: 15 }}>
                        Buscar alumno
                      </Text>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Consultar ficha e historial
                      </Text>
                    </div>
                    <ArrowRightOutlined className="inicio-acceso-arrow" />
                  </div>
                </Col>
              </Row>
            </div>

            {/* SECCIÓN PRINCIPAL: PRÓXIMOS CURSADOS (A ANCHO COMPLETO) */}
            <Row gutter={[20, 20]} style={{ marginTop: 24 }}>
              <Col xs={24}>
                <section className="inicio-card-seccion">
                  <div className="inicio-card-header">
                    <div>
                      <Title level={4} style={{ margin: 0 }}>
                        Próximos cursados
                      </Title>
                      <Text type="secondary">
                        Tus clases programadas para esta semana
                      </Text>
                    </div>
                  </div>

                  <Table<ProximaClase>
                    rowKey="id"
                    columns={columnasClases}
                    dataSource={proximasClasesMock}
                    pagination={false}
                    className="inicio-table"
                  />
                </section>
              </Col>
            </Row>

            <Text className="inicio-pie-pagina">
              AulaActiva · Sistema de gestión académica
            </Text>
          </Content>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
}