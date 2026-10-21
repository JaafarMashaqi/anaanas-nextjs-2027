'use client'
import { signIn } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'

import { useNotificationContext } from '@/context/useNotificationContext'
import useQueryParams from '@/hooks/useQueryParams'
import { t } from '@/lib/translations'
import { DEFAULT_LOCALE, isSupportedLocale } from '@/lib/localization'
import type { SupportedLocale } from '@/lib/localization'

async function redirectAfterAuth(locale: SupportedLocale, push: (path: string) => void, fallback?: string) {
  push(fallback ?? `/${locale}`)
}

const useSignIn = (locale?: SupportedLocale) => {
  const [loading, setLoading] = useState(false)
  const { push } = useRouter()
  const { showNotification } = useNotificationContext()
  const params = useParams<{ locale?: string }>()

  const resolvedLocale: SupportedLocale = (() => {
    if (locale && isSupportedLocale(locale)) return locale
    const localeFromParams = Array.isArray(params?.locale) ? params.locale[0] : params?.locale
    if (localeFromParams && isSupportedLocale(localeFromParams)) return localeFromParams
    return DEFAULT_LOCALE
  })()

  const queryParams = useQueryParams()

  const loginFormSchema = yup.object({
    email: yup.string().email(t('auth.invalidEmail', resolvedLocale)).optional(),
    mobile: yup.string().optional(),
    password: yup.string().required(t('auth.passwordRequired', resolvedLocale)),
  }).test(
    'email-or-mobile-required',
    resolvedLocale === 'ar' ? 'يرجى إدخال البريد الإلكتروني أو رقم الهاتف' : 'Please enter email or phone number',
    function (value) {
      const { email, mobile } = value
      if (!email && !mobile) {
        return this.createError({
          path: 'email',
          message: resolvedLocale === 'ar' ? 'يرجى إدخال البريد الإلكتروني أو رقم الهاتف' : 'Please enter email or phone number',
  })
      }
      return true
    }
  )

  const { control, handleSubmit } = useForm({
    resolver: yupResolver(loginFormSchema),
    defaultValues: {
      email: '',
      mobile: '',
      password: '',
    },
  })

  type LoginFormFields = yup.InferType<typeof loginFormSchema>

  const login = handleSubmit(async (values: LoginFormFields) => {
    setLoading(true)
    try {
      const result = await signIn('credentials', {
      redirect: false,
        email: values?.email || undefined,
        mobile: values?.mobile || undefined,
      password: values?.password,
      })

      if (result?.ok) {
        const requested = queryParams['redirectTo']
        const redirectTo = typeof requested === 'string' && requested.startsWith('/') && !requested.startsWith('//')
          ? requested
          : `/${resolvedLocale}`
        await redirectAfterAuth(resolvedLocale, push, redirectTo)
        showNotification({ 
          message: resolvedLocale === 'ar' 
            ? 'تم تسجيل الدخول بنجاح. جاري إعادة التوجيه....' 
            : 'Successfully signed in. Redirecting...', 
          variant: 'success' 
        })
      } else {
        showNotification({ 
          message: result?.error || (resolvedLocale === 'ar' ? 'بيانات الدخول غير صحيحة' : 'Invalid login credentials'), 
          variant: 'danger' 
        })
      }
    } catch (error) {
      showNotification({ 
        message: error instanceof Error 
          ? error.message 
          : (resolvedLocale === 'ar' ? 'حدث خطأ' : 'An error occurred'), 
        variant: 'danger' 
      })
    } finally {
    setLoading(false)
    }
  })

  return { loading, login, control }
}

export default useSignIn
