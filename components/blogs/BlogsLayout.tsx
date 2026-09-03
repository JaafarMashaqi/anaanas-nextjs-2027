import type { ReactNode } from 'react'
import { Col, Container, Row } from 'react-bootstrap'

import type { SupportedLocale } from '@/lib/localization'

import styles from './blogsLayout.module.css'

type BlogsLayoutProps = {
  locale: SupportedLocale
  variant?: 'list' | 'detail'
  children: ReactNode
}

const BlogsLayout = ({ locale, variant = 'list', children }: BlogsLayoutProps) => {
  const colClass = variant === 'detail' ? styles.detailCol : styles.listCol

  return (
    <div className={styles.page} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <main className={styles.main}>
        <Container>
          <Row className="justify-content-center">
            <Col xs={12} className={colClass}>
              {children}
            </Col>
          </Row>
        </Container>
      </main>
    </div>
  )
}

export default BlogsLayout
