import { Button } from 'antd'
import { ArrowLeftOutlined, ScheduleOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '../../constants/routes'
import styles from './EncabezadoAlumno.module.css'

function EncabezadoAlumno() {
  const navigate = useNavigate()

  return (
    <header className={styles.header}>
      <div className={styles.headerInner}>
        <div className={styles.brand}>
          <span className={styles.logoMark}>
            <ScheduleOutlined />
          </span>
          <span className={styles.brandText}>AulaActiva</span>
        </div>

        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(ROUTES.ALUMNO)}>
          Volver al panel
        </Button>
      </div>
    </header>
  )
}

export default EncabezadoAlumno
