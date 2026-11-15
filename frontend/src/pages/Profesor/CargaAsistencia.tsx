import { useMemo, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getCursosDocente, type CursoDocente } from "../../services/docenteService";
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
  Space,
  Avatar,
  Dropdown,
  Drawer,
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
import { clearSession, getSessionUser } from "../../services/auth";
import { ROUTES } from "../../constants/routes";
import {
  obtenerAlumnosPorCurso,
  obtenerAsistenciasPorFecha,
  guardarAsistenciaCurso,
  type RegistroAsistenciaDto,
} from "../../services/cursosService";
import "./CargaAsistencia.css";

const { Sider, Header, Content } = Layout;
const { Title, Text } = Typography;

type EstadoAsistencia = "PRESENTE" | "AUSENTE" | "TARDANZA" | "JUSTIFICADA" | "SUSPENDIDA";

interface Alumno {
  legajoAlumno: number;
  idCursoAlumno: number;
  nombre: string;
  apellido: string;
  email: string;
  estado?: EstadoAsistencia;
}

const colorEstado: Record<EstadoAsistencia, string> = {
  PRESENTE: "success",
  AUSENTE: "error",
  TARDANZA: "warning",
  JUSTIFICADA: "processing",
  SUSPENDIDA: "default",
};

const textoEstado: Record<EstadoAsistencia, string> = {
  PRESENTE: "Presente",
  AUSENTE: "Ausente",
  TARDANZA: "Tarde",
  JUSTIFICADA: "Justificada",
  SUSPENDIDA: "Suspendida",
};

export default function CargaAsistencia() {
  const navigate = useNavigate();
  const usuario = getSessionUser();
  
  const location = useLocation();
  const [idCurso, setIdCurso] = useState<number>(() => {
    const state = location.state as { comisionId?: string };
    if (state?.comisionId) {
      const parsed = Number(state.comisionId);
      return isNaN(parsed) ? 1 : parsed;
    }
    return 1;
  });
  const [cursosDocente, setCursosDocente] = useState<CursoDocente[]>([]);
  const [fecha, setFecha] = useState<Dayjs | null>(dayjs());
  const [busqueda, setBusqueda] = useState("");
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);
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
  useEffect(() => {
    getCursosDocente()
      .then((data) => {
        setCursosDocente(data);
      })
      .catch((err) => {
        console.error("No se pudieron cargar los cursos del docente", err);
      });
  }, []);

  // Cargar alumnos y asistencias desde el backend al cambiar de curso o fecha
  useEffect(() => {
    const cargarDatosBackend = async () => {
      try {
        setLoading(true);
        const fechaStr = fecha ? fecha.format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD");

        // 1. Obtenemos los alumnos inscriptos al curso
        const listaAlumnos = await obtenerAlumnosPorCurso(idCurso);

        // 2. Obtenemos las asistencias ya registradas para esa fecha
        const asistenciasPrevias = await obtenerAsistenciasPorFecha(idCurso, fechaStr);

        // Mapeamos los estados existentes a los alumnos
        const mapaAsistencias = new Map<number, EstadoAsistencia>();
        asistenciasPrevias.forEach((item: any) => {
          mapaAsistencias.set(item.legajoAlumno, item.estado);
        });

        const alumnosConEstado: Alumno[] = listaAlumnos.map((alum: any) => ({
          ...alum,
          estado: mapaAsistencias.get(alum.legajoAlumno) || undefined,
        }));

        setAlumnos(alumnosConEstado);
      } catch (error: any) {
        console.error(error);
        messageApi.error(error.response?.data?.message || "Error al cargar los datos del curso.");
      } finally {
        setLoading(false);
      }
    };

    cargarDatosBackend();
  }, [idCurso, fecha]);

  const presentes = alumnos.filter((a) => a.estado === "PRESENTE").length;
  const ausentes = alumnos.filter((a) => a.estado === "AUSENTE").length;
  const tarde = alumnos.filter((a) => a.estado === "TARDANZA").length;
  const justificadas = alumnos.filter((a) => a.estado === "JUSTIFICADA").length;
  const pendientes = alumnos.filter((a) => !a.estado).length;

  const alumnosFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    return alumnos.filter((a) =>
      `${a.nombre} ${a.apellido} ${a.legajoAlumno}`
        .toLowerCase()
        .includes(texto)
    );
  }, [alumnos, busqueda]);

  const actualizarEstado = (
    legajoAlumno: number,
    estado: EstadoAsistencia
  ) => {
    setAlumnos((actuales) =>
      actuales.map((a) =>
        a.legajoAlumno === legajoAlumno ? { ...a, estado } : a
      )
    );
  };

  const marcarTodos = (estado: EstadoAsistencia) => {
    setAlumnos((actuales) =>
      actuales.map((a) => ({ ...a, estado }))
    );
  };

  const guardarAsistencia = async () => {
    if (!fecha) {
      messageApi.warning("Seleccioná una fecha.");
      return;
    }

    if (pendientes > 0) {
      messageApi.warning(`Todavía falta registrar a ${pendientes} alumno(s).`);
      return;
    }

    try {
      setLoading(true);
      const fechaStr = fecha.format("YYYY-MM-DD");
      const registros: RegistroAsistenciaDto[] = alumnos.map((a) => ({
        legajoAlumno: a.legajoAlumno,
        estado: a.estado || "PRESENTE",
      }));

      await guardarAsistenciaCurso(idCurso, fechaStr, registros);
      messageApi.success("¡Asistencia guardada correctamente en el servidor!");
    } catch (error: any) {
      console.error(error);
      messageApi.error(error.response?.data?.message || "Hubo un error al guardar la asistencia.");
    } finally {
      setLoading(false);
    }
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
              Legajo {alumno.legajoAlumno}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: "ESTADO DE ASISTENCIA",
      key: "estado",
      width: 520,
      render: (_, alumno) => {
        const estiloBoton = (valor: EstadoAsistencia) => {
          const seleccionado = alumno.estado === valor;
          let colorSeleccionadoBg = "#f5f5f5";
          let colorSeleccionadoTexto = "#595959";
          let colorBorde = "#d9d9d9";

          if (seleccionado) {
            if (valor === "PRESENTE") { colorSeleccionadoBg = "#f6ffed"; colorSeleccionadoTexto = "#52c41a"; colorBorde = "#b7eb8f"; }
            if (valor === "AUSENTE") { colorSeleccionadoBg = "#fff2f0"; colorSeleccionadoTexto = "#ff4d4f"; colorBorde = "#ffccc7"; }
            if (valor === "TARDANZA") { colorSeleccionadoBg = "#fff7e6"; colorSeleccionadoTexto = "#fa8c16"; colorBorde = "#ffd591"; }
            if (valor === "JUSTIFICADA") { colorSeleccionadoBg = "#e6f7ff"; colorSeleccionadoTexto = "#1890ff"; colorBorde = "#91caff"; }
            if (valor === "SUSPENDIDA") { colorSeleccionadoBg = "#f0f0f0"; colorSeleccionadoTexto = "#595959"; colorBorde = "#d9d9d9"; }
          }

          return {
            backgroundColor: seleccionado ? colorSeleccionadoBg : "#ffffff",
            color: seleccionado ? colorSeleccionadoTexto : "#595959",
            borderColor: seleccionado ? colorBorde : "#d9d9d9",
            fontWeight: seleccionado ? 600 : 400,
            boxShadow: "none",
          };
        };

        return (
          <Space size={4}>
            <Button style={estiloBoton("PRESENTE")} onClick={() => actualizarEstado(alumno.legajoAlumno, "PRESENTE")}>
              <CheckCircleFilled style={{ color: alumno.estado === "PRESENTE" ? "#52c41a" : undefined }} /> P
            </Button>
            <Button style={estiloBoton("AUSENTE")} onClick={() => actualizarEstado(alumno.legajoAlumno, "AUSENTE")}>
              <CloseCircleOutlined style={{ color: alumno.estado === "AUSENTE" ? "#ff4d4f" : undefined }} /> A
            </Button>
            <Button style={estiloBoton("TARDANZA")} onClick={() => actualizarEstado(alumno.legajoAlumno, "TARDANZA")}>
              <ClockCircleOutlined style={{ color: alumno.estado === "TARDANZA" ? "#fa8c16" : undefined }} /> T
            </Button>
            <Button style={estiloBoton("JUSTIFICADA")} onClick={() => actualizarEstado(alumno.legajoAlumno, "JUSTIFICADA")}>
              <InfoCircleOutlined style={{ color: alumno.estado === "JUSTIFICADA" ? "#1890ff" : undefined }} /> J
            </Button>
          </Space>
        );
      },
    },
    {
      title: "REGISTRO",
      key: "registro",
      align: "center",
      width: 140,
      render: (_, alumno) =>
        alumno.estado ? (
          <Tag
            color={colorEstado[alumno.estado]}
            style={{ borderRadius: 6, padding: "4px 10px" }}
          >
            {textoEstado[alumno.estado]}
          </Tag>
        ) : (
          <Text style={{ color: "#a2a9a3", fontSize: 12 }}>Pendiente</Text>
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
      if (key === "salir") {
        cerrarSesion();
        return;
      }
      if (key === "perfil") {
        navigate("/profesor/perfil");
        return;
      }
      messageApi.info("Esta función estará disponible próximamente.");
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
      <div className="asistencia-logo">
        <div className="asistencia-logo-icon">
          <BookOutlined />
        </div>
        <span>AulaActiva</span>
      </div>

      <Text className="asistencia-menu-label">MENÚ PRINCIPAL</Text>

      <Menu
        mode="inline"
        inlineIndent={16}
        selectedKeys={["asistencia"]}
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
          {contenidoMenu}
        </Sider>

        <Drawer
          placement="left"
          size={260}
          open={menuAbierto}
          onClose={() => setMenuAbierto(false)}
          closable={false}
          className="asistencia-drawer"
          styles={{ body: { padding: 0, display: "flex", flexDirection: "column" } }}
        >
          {contenidoMenu}
        </Drawer>

        <Layout style={{ minWidth: 0, background: "#f6f8f6" }}>
          <Header className="asistencia-header">
            <Button
              type="text"
              icon={<MenuOutlined />}
              className="asistencia-menu-mobile"
              onClick={() => setMenuAbierto(!menuAbierto)}
            />

            <div className="asistencia-header-right">
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

          <Content className="asistencia-content">
            <div className="asistencia-titulo">
              <Text className="asistencia-migas">
                Inicio / Mis cursos / <span>Cargar asistencia</span>
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
                <Text strong>Curso (ID)</Text>
                <Select
                  value={idCurso}
                  onChange={setIdCurso}
                  style={{ width: "100%", marginTop: 8 }}
                  options={cursosDocente.map((curso) => ({
                    value: curso.idCurso,
                    label: `${curso.materia.nombre} - Comisión ${curso.comision} (${curso.periodo} ${curso.anio})`,
                  }))}
                  suffixIcon={<BookOutlined />}
                  placeholder="Seleccioná un curso"
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
                loading={loading}
              >
                Guardar asistencia
              </Button>
            </section>

            <div className="asistencia-resumen">
              <div className="asistencia-resumen-item">
                <div className="asistencia-resumen-icon neutro"><TeamOutlined /></div>
                <div>
                  <Text type="secondary">Total de alumnos</Text>
                  <Title level={3} style={{ margin: 0 }}>{alumnos.length}</Title>
                </div>
              </div>

              <div className="asistencia-resumen-item">
                <div className="asistencia-resumen-icon verde"><CheckCircleFilled /></div>
                <div>
                  <Text type="secondary">Presentes (P)</Text>
                  <Title level={3} style={{ margin: 0, color: "#39805a" }}>{presentes}</Title>
                </div>
              </div>

              <div className="asistencia-resumen-item">
                <div className="asistencia-resumen-icon rojo"><CloseCircleOutlined /></div>
                <div>
                  <Text type="secondary">Ausentes (A)</Text>
                  <Title level={3} style={{ margin: 0, color: "#d75b57" }}>{ausentes}</Title>
                </div>
              </div>

              <div className="asistencia-resumen-item">
                <div className="asistencia-resumen-icon amarillo"><ClockCircleOutlined /></div>
                <div>
                  <Text type="secondary">Llegadas tarde (T)</Text>
                  <Title level={3} style={{ margin: 0, color: "#c48a28" }}>{tarde}</Title>
                </div>
              </div>

              <div className="asistencia-resumen-item">
                <div className="asistencia-resumen-icon azul" style={{ color: "#1677ff", background: "#e6f4ff" }}><InfoCircleOutlined /></div>
                <div>
                  <Text type="secondary">Justificadas (J)</Text>
                  <Title level={3} style={{ margin: 0, color: "#1677ff" }}>{justificadas}</Title>
                </div>
              </div>
            </div>

            <section className="asistencia-tabla">
              <div className="asistencia-tabla-header">
                <div>
                  <Title level={4} style={{ margin: 0 }}>Lista de alumnos</Title>
                  <Text type="secondary">Seleccioná el estado de cada alumno.</Text>
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
                        { key: "PRESENTE", label: "Todos Presentes (P)" },
                        { key: "AUSENTE", label: "Todos Ausentes (A)" },
                        { key: "TARDANZA", label: "Todos Tarde (T)" },
                        { key: "JUSTIFICADA", label: "Todos Justificados (J)" },
                      ],
                      onClick: ({ key }) => marcarTodos(key as EstadoAsistencia),
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
                rowKey="legajoAlumno"
                columns={columnas}
                dataSource={alumnosFiltrados}
                pagination={false}
                scroll={{ x: 850 }}
                className="asistencia-table"
                loading={loading}
                locale={{ emptyText: "No se encontraron alumnos inscriptos en este curso." }}
              />

              <div className="asistencia-pie-tabla">
                <Text type="secondary">
                  {alumnos.length} alumnos · {pendientes} pendientes de registrar
                </Text>

                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  onClick={guardarAsistencia}
                  loading={loading}
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