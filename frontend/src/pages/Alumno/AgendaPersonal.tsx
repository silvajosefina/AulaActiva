
import { useEffect, useState } from 'react'
import { isAxiosError } from 'axios'
import {
  Button,
  Calendar,
  Card,
  DatePicker,
  Empty,
  Form,
  Input,
  Modal,
  Popconfirm,
  Select,
  Spin,
  Tag,
  TimePicker,
  Typography,
  message,
} from 'antd'
import {
  ClockCircleOutlined,
  PlusOutlined,
  DeleteOutlined,
} from '@ant-design/icons'
import dayjs, { type Dayjs } from 'dayjs'
import EncabezadoAlumno from '../../components/EncabezadoAlumno/EncabezadoAlumno'
import {
  obtenerEventosPersonales,
  crearEventoPersonal,
  actualizarEventoPersonal,
  eliminarEventoPersonal,
  type EventoPersonal,
  type EventoPersonalInput,
  type TipoEventoPersonal,
} from '../../services/agendaPersonal'
import styles from './AgendaPersonal.module.css'

const { Title, Text, Paragraph } = Typography

interface FormularioEvento {
  titulo: string
  tipo: TipoEventoPersonal
  fecha: Dayjs
  horaInicio?: Dayjs | null
  horaFin?: Dayjs | null
  notas?: string
}

const tiposEvento: TipoEventoPersonal[] = [
  'Parcial',
  'Final',
  'Entrega de TP',
  'Reunión',
  'Recordatorio',
  'Otro',
]

// Obtiene el mensaje enviado por el Backend o utiliza uno alternativo.
function obtenerMensajeError(
  error: unknown,
  mensajeAlternativo: string,
): string {
  if (isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message ?? mensajeAlternativo
  }

  return mensajeAlternativo
}

function formatearFecha(fecha: string): string {
  return new Intl.DateTimeFormat('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date(`${fecha}T12:00:00`))
}

function AgendaPersonal() {
  const [eventos, setEventos] = useState<EventoPersonal[]>([])
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)

  const [mesVisible, setMesVisible] = useState<Dayjs>(() => dayjs())

  const [fechaSeleccionada, setFechaSeleccionada] = useState<Dayjs>(
    () => dayjs(),
  )

  const [modalAbierto, setModalAbierto] = useState(false)
  const [eventoEditado, setEventoEditado] =
    useState<EventoPersonal | null>(null)

  const [form] = Form.useForm<FormularioEvento>()

  // Al ingresar a la agenda, consultamos los eventos del alumno.
  useEffect(() => {
    let componenteActivo = true

    async function cargarEventos() {
      try {
        const eventosObtenidos = await obtenerEventosPersonales()

        if (componenteActivo) {
          setEventos(eventosObtenidos)
        }
      } catch (error) {
        if (componenteActivo) {
          message.error(
            obtenerMensajeError(
              error,
              'No se pudieron cargar tus compromisos.',
            ),
          )
        }
      } finally {
        if (componenteActivo) {
          setCargando(false)
        }
      }
    }

    cargarEventos()

    return () => {
      componenteActivo = false
    }
  }, [])

  const claveFechaSeleccionada =
    fechaSeleccionada.format('YYYY-MM-DD')

  const eventosDelDia = eventos.filter(
    (evento) => evento.fecha === claveFechaSeleccionada,
  )

  function abrirNuevoCompromiso() {
    setEventoEditado(null)

    form.resetFields()

    form.setFieldsValue({
      titulo: '',
      tipo: 'Recordatorio',
      fecha: fechaSeleccionada,
      horaInicio: null,
      horaFin: null,
      notas: '',
    })

    setModalAbierto(true)
  }

  function abrirEdicion(evento: EventoPersonal) {
    setEventoEditado(evento)

    form.setFieldsValue({
      titulo: evento.titulo,
      tipo: evento.tipo,
      fecha: dayjs(evento.fecha),
      horaInicio: evento.horaInicio
        ? dayjs(evento.horaInicio, 'HH:mm')
        : null,
      horaFin: evento.horaFin
        ? dayjs(evento.horaFin, 'HH:mm')
        : null,
      notas: evento.notas ?? '',
    })

    setModalAbierto(true)
  }

  // Prepara los datos que espera el Backend.
  function prepararDatosEvento(
    valores: FormularioEvento,
  ): EventoPersonalInput {
    return {
      titulo: valores.titulo.trim(),
      tipo: valores.tipo,
      fecha: valores.fecha.format('YYYY-MM-DD'),
      horaInicio: valores.horaInicio?.format('HH:mm') || undefined,
      horaFin: valores.horaFin?.format('HH:mm') || undefined,
      notas: valores.notas?.trim() || undefined,
    }
  }

  // Guarda un evento nuevo o actualiza uno existente.
  async function guardarCompromiso(
    valores: FormularioEvento,
  ): Promise<void> {
    if (guardando) return

    setGuardando(true)

    try {
      const datosEvento = prepararDatosEvento(valores)

      if (eventoEditado) {
        const eventoActualizado = await actualizarEventoPersonal(
          eventoEditado.id,
          datosEvento,
        )

        setEventos((eventosActuales) =>
          eventosActuales.map((evento) =>
            evento.id === eventoActualizado.id
              ? eventoActualizado
              : evento,
          ),
        )

        message.success(
          'Compromiso actualizado correctamente.',
        )
      } else {
        const eventoCreado = await crearEventoPersonal(datosEvento)

        setEventos((eventosActuales) => [
          ...eventosActuales,
          eventoCreado,
        ])

        message.success(
          'Compromiso creado correctamente.',
        )
      }

      setFechaSeleccionada(valores.fecha)
      setMesVisible(valores.fecha)

      setModalAbierto(false)
      setEventoEditado(null)
      form.resetFields()
    } catch (error) {
      message.error(
        obtenerMensajeError(
          error,
          'No se pudo guardar el compromiso.',
        ),
      )
    } finally {
      setGuardando(false)
    }
  }

  // Elimina el evento seleccionado en el Backend.
  async function eliminarCompromiso(): Promise<void> {
    if (!eventoEditado || guardando) return

    setGuardando(true)

    try {
      await eliminarEventoPersonal(eventoEditado.id)

      setEventos((eventosActuales) =>
        eventosActuales.filter(
          (evento) => evento.id !== eventoEditado.id,
        ),
      )

      setModalAbierto(false)
      setEventoEditado(null)
      form.resetFields()

      message.success('Compromiso eliminado correctamente.')
    } catch (error) {
      message.error(
        obtenerMensajeError(
          error,
          'No se pudo eliminar el compromiso.',
        ),
      )
    } finally {
      setGuardando(false)
    }
  }

  function cerrarModal() {
    if (guardando) return

    setModalAbierto(false)
    setEventoEditado(null)
    form.resetFields()
  }

  return (
    <>
      <EncabezadoAlumno />
      <main className={styles.contenedor}>
        <section className={styles.introduccion}>
          <Text className={styles.etiqueta}>
            SOLO VOS VES TUS EVENTOS
          </Text>

          <Title level={1}>Mi Agenda Personal</Title>

          <Paragraph>
            Organizá parciales, entregas, reuniones y recordatorios
            en un solo lugar.
          </Paragraph>

          <Button
            type="primary"
            icon={<PlusOutlined />}
            className={styles.botonNuevo}
            onClick={abrirNuevoCompromiso}
            disabled={cargando}
          >
            Nuevo compromiso
          </Button>
        </section>

        <Spin spinning={cargando}>
          <Card className={styles.calendario} variant="borderless">
            <Calendar
              value={mesVisible}
              onChange={(fecha) => setMesVisible(fecha)}
              onSelect={(fecha) => {
                setFechaSeleccionada(fecha)
                setMesVisible(fecha)
              }}
              cellRender={(fecha) => {
                const eventosDeLaFecha = eventos.filter(
                  (evento) =>
                    evento.fecha === fecha.format('YYYY-MM-DD'),
                )

                return (
                  <>
                    {eventosDeLaFecha.slice(0, 2).map((evento) => (
                      <Tag
                        key={evento.id}
                        className={styles.etiquetaEvento}
                        onClick={(e) => {
                          e.stopPropagation()
                          setFechaSeleccionada(fecha)
                          abrirEdicion(evento)
                        }}
                      >
                        {evento.titulo}
                      </Tag>
                    ))}

                    {eventosDeLaFecha.length > 2 && (
                      <Text type="secondary">
                        +{eventosDeLaFecha.length - 2} más
                      </Text>
                    )}
                </>
              )
            }}
          />
        </Card>

        <section className={styles.eventos}>
          <Title level={2}>Compromisos del día</Title>

          <Text type="secondary">
            {formatearFecha(claveFechaSeleccionada)}
          </Text>

          {eventosDelDia.length === 0 ? (
            <Empty description="No tenés compromisos para este día." />
          ) : (
            eventosDelDia.map((evento) => (
              <Card
                key={evento.id}
                className={styles.evento}
                variant="borderless"
                hoverable
                onClick={() => abrirEdicion(evento)}
              >
                <Tag className={styles.etiquetaTipo}>
                  {evento.tipo}
                </Tag>

                <Title level={4}>{evento.titulo}</Title>

                {(evento.horaInicio || evento.horaFin) && (
                  <Text className={styles.horario}>
                    <ClockCircleOutlined />{' '}
                    {evento.horaInicio ?? ''}
                    {evento.horaFin ? ` a ${evento.horaFin}` : ''}
                  </Text>
                )}

                {evento.notas && (
                  <Paragraph>{evento.notas}</Paragraph>
                )}

                <Text type="secondary">
                  Seleccioná para ver o modificar
                </Text>
              </Card>
            ))
          )}
        </section>
      </Spin>

      <Modal
        title={
          eventoEditado
            ? 'Modificar compromiso'
            : 'Nuevo compromiso'
        }
        open={modalAbierto}
        onCancel={cerrarModal}
        onOk={() => form.submit()}
        okText="Guardar"
        cancelText="Cancelar"
        confirmLoading={guardando}
        closable={!guardando}
        mask={{ closable: !guardando }}
        className={styles.modalAgenda}
        footer={[
          ...(eventoEditado
            ? [
                <Popconfirm
                  key="eliminar"
                  title="¿Eliminar este compromiso?"
                  description="Esta acción no se puede deshacer."
                  okText="Sí, eliminar"
                  cancelText="Cancelar"
                  onConfirm={eliminarCompromiso}
                  disabled={guardando}
                >
                  <Button
                    danger
                    icon={<DeleteOutlined />}
                    disabled={guardando}
                  >
                    Eliminar
                  </Button>
                </Popconfirm>,
              ]
            : []),
          <Button
            key="cancelar"
            onClick={cerrarModal}
            disabled={guardando}
          >
            Cancelar
          </Button>,
          <Button
            key="guardar"
            type="primary"
            loading={guardando}
            onClick={() => form.submit()}
          >
            Guardar
          </Button>,
        ]}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={guardarCompromiso}
        >
          <Form.Item
            name="titulo"
            label="Título del compromiso"
            rules={[
              {
                required: true,
                whitespace: true,
                message: 'Ingresá un título para el compromiso.',
              },
            ]}
          >
            <Input placeholder="Ej.: Parcial de Programación II" />
          </Form.Item>

          <Form.Item
            name="tipo"
            label="Tipo de compromiso"
            rules={[
              {
                required: true,
                message: 'Seleccioná un tipo.',
              },
            ]}
          >
            <Select
              options={tiposEvento.map((tipo) => ({
                label: tipo,
                value: tipo,
              }))}
            />
          </Form.Item>

          <Form.Item
            name="fecha"
            label="Fecha"
            rules={[
              {
                required: true,
                message: 'Seleccioná una fecha.',
              },
            ]}
          >
            <DatePicker
              format="DD/MM/YYYY"
              style={{ width: '100%' }}
              placeholder="Seleccionar fecha"
            />
          </Form.Item>

          <Form.Item name="horaInicio" label="Hora de inicio">
            <TimePicker
              format="HH:mm"
              style={{ width: '100%' }}
              placeholder="Seleccionar hora"
              minuteStep={5}
            />
          </Form.Item>

          <Form.Item name="horaFin" label="Hora de finalización">
            <TimePicker
              format="HH:mm"
              style={{ width: '100%' }}
              placeholder="Seleccionar hora"
              minuteStep={5}
            />
          </Form.Item>

          <Form.Item name="notas" label="Notas">
            <Input.TextArea
              rows={3}
              placeholder="Agregá detalles o recordatorios..."
            />
          </Form.Item>
        </Form>
      </Modal>
    </main>
    </>
  )
}

export default AgendaPersonal
