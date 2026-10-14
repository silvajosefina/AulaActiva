import { Typography } from 'antd'
import styles from './BrandPanel.module.css'

const { Title, Paragraph } = Typography

function BrandPanel() {
  return (
    <div className={styles.panel}>
      <div className={styles.blobOne} />
      <div className={styles.blobTwo} />
      <div className={styles.content}>
        <Title level={1} className={styles.wordmark}>
          AulaActiva
        </Title>
        <Paragraph className={styles.tagline}>
          Gestión de asistencia pensada para instituciones educativas de todos los niveles.
        </Paragraph>
      </div>
    </div>
  )
}

export default BrandPanel
