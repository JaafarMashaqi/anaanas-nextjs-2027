'use client'

import { SessionProvider } from 'next-auth/react'
import { useEffect } from 'react'
import { ToastContainer } from 'react-toastify'

import { NotificationProvider } from '@/context/useNotificationContext'
import type { ChildrenType } from '@/types/component'
import { ChatProvider } from '@/context/useChatContext'
import { AppDataProvider } from '@/context/AppDataContext'
import { CurrentUserProvider } from '@/context/useCurrentUser'
import { LayoutProvider } from '@/context/useLayoutContext'
import { PlatformPublicSettingsProvider } from '@/context/PlatformPublicSettingsContext'
import AutoLoginWrapper from './AutoLoginWrapper'
import { EmailVerificationProvider } from '@/context/EmailVerificationProvider'
import DirectionSync from '@/components/DirectionSync'
import ScrollToTopOnRoute from '@/components/ScrollToTopOnRoute'
import { SPLASH_MAX_VISIBLE_MS } from '@/lib/perf/week1HomePerf'

const AppProvidersWrapper = ({ children }: ChildrenType) => {
  useEffect(() => {
    const splashElement = document.querySelector<HTMLDivElement>('#__next_splash')
    const splashScreen = document.querySelector('#splash-screen')

    if (!splashElement || !splashScreen) return

    const hideSplash = () => splashScreen.classList.add('remove')

    const handleMutations = (mutationsList: MutationRecord[]) => {
      for (const mutation of mutationsList) {
        if (mutation.type === 'childList' && splashElement.hasChildNodes()) {
          hideSplash()
        }
      }
    }
    const observer = new MutationObserver(handleMutations)
    observer.observe(splashElement, { childList: true, subtree: true })
    if (splashElement.hasChildNodes()) {
      hideSplash()
    }

    const maxVisibleTimer = window.setTimeout(hideSplash, SPLASH_MAX_VISIBLE_MS)

    return () => {
      observer.disconnect()
      window.clearTimeout(maxVisibleTimer)
    }
  }, [])

  return (
    <SessionProvider refetchOnWindowFocus={false} refetchInterval={0}>
      <DirectionSync />
      <ScrollToTopOnRoute />
      <AutoLoginWrapper>
        <EmailVerificationProvider>
          <CurrentUserProvider>
            <AppDataProvider>
              <PlatformPublicSettingsProvider>
                <LayoutProvider>
                  <ChatProvider>
                    <NotificationProvider>
                      {children}
                      <ToastContainer theme="colored" />
                    </NotificationProvider>
                  </ChatProvider>
                </LayoutProvider>
              </PlatformPublicSettingsProvider>
            </AppDataProvider>
          </CurrentUserProvider>
        </EmailVerificationProvider>
      </AutoLoginWrapper>
    </SessionProvider>
  )
}
export default AppProvidersWrapper
