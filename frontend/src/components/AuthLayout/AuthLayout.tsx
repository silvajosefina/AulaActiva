import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Typography } from 'antd'
import { ScheduleOutlined } from '@ant-design/icons'
import BrandPanel from './BrandPanel'
import { ROUTES } from '../../constants/routes'
import styles from './AuthLayout.module.css'

const { Title, Paragraph } = Typography

interface AuthLayoutProps {
  title: string
  subtitle?: string
  children: ReactNode
}

function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.formSide}>
        <div className={styles.formCard}>
          <div className={styles.header}>
            <Link to={ROUTES.INICIO} className={styles.brandRow}>
              <span className={styles.logoMark}>
                <ScheduleOutlined />
              </span>
              <Title level={3} className={styles.brand}>
                AulaActiva
              </Title>
            </Link>
            <Title level={5} className={styles.title} type="secondary">
              {title}
            </Title>
            {subtitle && (
              <Paragraph type="secondary" className={styles.subtitle}>
                {subtitle}
              </Paragraph>
            )}
          </div>
          {children}
        </div>
      </div>
      <div className={styles.brandSide} aria-hidden="true">
        <BrandPanel />
      </div>
    </div>
  )
}

export default AuthLayout
