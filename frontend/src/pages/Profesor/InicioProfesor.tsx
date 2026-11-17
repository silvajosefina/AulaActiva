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
  Table,
  message,
  Drawer,
  Alert,
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
import axios from "axios";
import dayjs from "dayjs";
import "dayjs/locale/es";
import locale from "antd/locale/es_ES";
import { clearSession, getSessionUser } from "../../services/auth";
import { ROUTES } from "../../constants/routes";
import {
  getInicioDocente,
  type InicioDocente,
  type ProximaClase,
} from "../../services/docenteService";
import "./InicioProfesor.css";

const { Sider, Header, Content } = Layout;
const { Title, Text } = Typography;

function describirCuando(clase: ProximaClase): string {
  const diasHasta = dayjs(clase.fecha).diff(dayjs().startOf("day"), "day");
  const cuando =
    diasHasta === 0
      ? "Hoy"
      : diasHasta === 1
        ? "Mañana"
        : `${clase.dia} ${dayjs(clase.fecha).date()}`;
  return `${cuando}, ${clase.horaInicio} - ${clase.horaFin} hs`;
}

export default function InicioProfesor() {
  const navigate = useNavigate();
  const usuario = getSessionUser();
  const [menuAbierto, setMenuAbierto] = useState(false);

  const [messageApi, contextHolder] = message.useMessage();
  const [inicio, setInicio] = useState<InicioDocente | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [intento, setIntento] = useState(0);

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

  useEffect(() => {
    let activo = true;
    getInicioDocente()
      .then((datos) => {
        if (activo) setInicio(datos);
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
            : "No pudimos cargar tu resumen. Intentá de nuevo."
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

  const kpi = (valor: number | undefined) => (cargando || valor === undefined ? "–" : valor);

  const irACargarAsistencia = (idCurso?: number) => {
    navigate(ROUTES.PROFESOR_ASISTENCIA, {
      state: idCurso === undefined ? undefined : { comisionId: String(idCurso) },
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
            Comisión {record.comision}
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
          <Text style={{ fontSize: 13 }}>{describirCuando(record)}</Text>
        </Space>
      ),
    },
    {
      title: "ALUMNOS",
      key: "alumnos",
      align: "center",
      render: (_, record) => (
        <Text style={{ fontSize: 13, fontWeight: 500 }}>
          {record.cantidadAlumnos} inscriptos
        </Text>
      ),
    },
    {
      title: "ESTADO / ACCIÓN",
      key: "accion",
      align: "right",
      render: (_, record) => {
        if (record.estadoAsistencia === "pendiente") {
          return (
            <Button
              type="primary"
              size="small"
              icon={<CalendarOutlined />}
              onClick={() => irACargarAsistencia(record.idCurso)}
              style={{ borderRadius: 6 }}
            >
              Cargar asistencia
            </Button>
          );
        }
        if (record.estadoAsistencia === "registrada") {
          return (
            <Tag icon={<CheckCircleOutlined />} color="success" style={{ borderRadius: 6, padding: "2px 8px" }}>
              Asistencia cargada
            </Tag>
          );
        }
        return (
          <Tag icon={<ClockCircleOutlined />} style={{ borderRadius: 6, padding: "2px 8px" }}>
            Programada
          </Tag>
        );
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
          setMenuAbierto(false);
          const ruta = rutasMenu[key];
          if (ruta) {
            navigate(ruta);
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
            <div className="inicio-encabezado">
              <Title level={2} style={{ margin: 0, color: "#26211a" }}>
                ¡Buen día, Prof. {usuario?.apellido ?? nombreCompleto}!
              </Title>
              <Text type="secondary" style={{ fontSize: 14 }}>
                Este es el resumen de tu actividad académica para hoy.
              </Text>
            </div>

            {error && (
              <Alert
                type="error"
                showIcon
                title={error}
                style={{ marginBottom: 20 }}
                action={
                  <Button size="small" onClick={reintentar}>
                    Reintentar
                  </Button>
                }
              />
            )}

            <div className="inicio-kpi-grid">
              <div className="inicio-kpi-card">
                <div className="inicio-kpi-icon brown">
                  <BookOutlined />
                </div>
                <div>
                  <Text type="secondary">Materias asignadas</Text>
                  <Title level={3} style={{ margin: 0 }}>{kpi(inicio?.resumen.materias)}</Title>
                </div>
              </div>

              <div className="inicio-kpi-card">
                <div className="inicio-kpi-icon brown">
                  <ReadOutlined />
                </div>
                <div>
                  <Text type="secondary">Cursos / Comisiones</Text>
                  <Title level={3} style={{ margin: 0 }}>{kpi(inicio?.resumen.cursos)}</Title>
                </div>
              </div>

              <div className="inicio-kpi-card">
                <div className="inicio-kpi-icon brown">
                  <TeamOutlined />
                </div>
                <div>
                  <Text type="secondary">Total de alumnos</Text>
                  <Title level={3} style={{ margin: 0 }}>{kpi(inicio?.resumen.alumnos)}</Title>
                </div>
              </div>

              <div className="inicio-kpi-card destacado">
                <div className="inicio-kpi-icon orange">
                  <CalendarOutlined />
                </div>
                <div>
                  <Text type="secondary">Asistencias pendientes</Text>
                  <Title level={3} style={{ margin: 0, color: "#bc9150" }}>
                    {kpi(inicio?.resumen.asistenciasPendientes)}
                  </Title>
                </div>
              </div>
            </div>

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
                    onClick={() => navigate(ROUTES.PROFESOR_CURSOS)}
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
                    onClick={() => navigate(ROUTES.PROFESOR_ALUMNOS)}
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
                    rowKey={(clase) => `${clase.idCurso}-${clase.fecha}-${clase.horaInicio}`}
                    columns={columnasClases}
                    dataSource={inicio?.proximasClases ?? []}
                    loading={cargando}
                    locale={{ emptyText: "No tenés clases en los próximos 7 días." }}
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