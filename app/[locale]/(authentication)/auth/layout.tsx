import type { ChildrenType } from '@/types/component'
import Link from 'next/link'
import { headers } from 'next/headers'
import { Col, Container, Row } from 'react-bootstrap'
import AuthLanguageSwitch from '@/components/auth/AuthLanguageSwitch'
import AuthFooterSocialLinks from '@/components/layout/AuthFooterSocialLinks'
import { t } from '@/lib/translations'
import { DEFAULT_LOCALE, isSupportedLocale } from '@/lib/localization'
import type { SupportedLocale } from '@/lib/localization'

const AuthLayout = async ({ children }: ChildrenType) => {
  const headersList = await headers()
  const localeFromHeader = headersList.get('x-locale')
  const locale: SupportedLocale = (localeFromHeader && isSupportedLocale(localeFromHeader)) ? localeFromHeader : DEFAULT_LOCALE
  return (
    <>
      <main className="auth-page">
        <Container>
          <Row className="justify-content-center">
            <Col xs={12} sm={10} md={8} lg={6} xl={5}>
              <AuthLanguageSwitch />
              <div className="auth-split">{children}</div>
            </Col>
          </Row>
        </Container>
      </main>

      <footer className="auth-footer">
        <Container>
          <Row className="justify-content-center">
            <Col sm={10} md={8} lg={6}>
              <div className="auth-footer-inner">
                <ul className="auth-footer-links">
                  <li>
                    <Link href={`/${locale}/p/terms`}>{t('auth.terms', locale)}</Link>
                  </li>
                  <li>
                    <Link href={`/${locale}/p/privacy`}>{t('auth.privacy', locale)}</Link>
                  </li>
                </ul>
                <AuthFooterSocialLinks />
              </div>
            </Col>
          </Row>
        </Container>
      </footer>
    </>
  )
}
export default AuthLayout
