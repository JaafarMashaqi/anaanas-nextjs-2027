'use client'

import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from 'react'
import { fetchSections, type Section } from '@/lib/api/sections'
import { fetchCountries, type Country } from '@/lib/api/countries'
import { fetchCitiesByCountryId, type City } from '@/lib/api/cities'
import { parseHost } from '@/lib/domain'
import { readPreferredCountryIsoFromDocumentCookie } from '@/lib/geo/preferredCountryCookie'
import { isPreviewCountryMode, PREVIEW_DEFAULT_COUNTRY } from '@/lib/preview/countryMode'

type AppDataContextType = {
  // Sections
  sections: Section[]
  loadingSections: boolean
  errorSections: Error | null
  refetchSections: () => Promise<void>

  // Countries
  countries: Country[]
  loadingCountries: boolean
  errorCountries: Error | null
  selectedCountry: Country | null
  setSelectedCountry: (country: Country | null) => void
  refetchCountries: () => Promise<void>

  // Cities
  cities: City[]
  loadingCities: boolean
  errorCities: Error | null
  refetchCities: (countryId: number) => Promise<void>
}

const AppDataContext = createContext<AppDataContextType | undefined>(undefined)

// Cache للبيانات
const cache = {
  sections: {
    data: null as Section[] | null,
    timestamp: 0,
    ttl: 5 * 60 * 1000, // 5 دقائق
  },
  countries: {
    data: null as Country[] | null,
    timestamp: 0,
    ttl: 10 * 60 * 1000, // 10 دقائق
  },
  cities: new Map<number, { data: City[]; timestamp: number }>(),
  citiesTtl: 10 * 60 * 1000, // 10 دقائق
}

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [sections, setSections] = useState<Section[]>([])
  const [loadingSections, setLoadingSections] = useState(false)
  const [errorSections, setErrorSections] = useState<Error | null>(null)

  const [countries, setCountries] = useState<Country[]>([])
  const [loadingCountries, setLoadingCountries] = useState(false)
  const [errorCountries, setErrorCountries] = useState<Error | null>(null)
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null)

  const [cities, setCities] = useState<City[]>([])
  const [loadingCities, setLoadingCities] = useState(false)
  const [errorCities, setErrorCities] = useState<Error | null>(null)

  // Track if component is mounted to prevent hydration mismatches
  const [mounted, setMounted] = useState(false)

  // الحصول على country code من subdomain - only after mount to prevent hydration issues
  const currentCountryCode = useMemo(() => {
    if (mounted && typeof window !== 'undefined') {
      if (isPreviewCountryMode()) {
        return (
          readPreferredCountryIsoFromDocumentCookie(document.cookie) ||
          PREVIEW_DEFAULT_COUNTRY
        )
      }
      const hostContext = parseHost(window.location.host)
      console.log('Parsed host context:', { host: window.location.host, hostContext })
      return hostContext.countrySubdomain || null
    }
    return null
  }, [mounted])

  // جلب Sections مع caching
  const refetchSections = useCallback(async () => {
    const now = Date.now()
    
    // التحقق من الـ cache
    if (cache.sections.data && (now - cache.sections.timestamp) < cache.sections.ttl) {
      setSections(cache.sections.data)
      return
    }

    setLoadingSections(true)
    setErrorSections(null)
    try {
      const data = await fetchSections()
      cache.sections.data = data
      cache.sections.timestamp = now
      setSections(data)
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to fetch sections')
      setErrorSections(err)
      console.error('Error fetching sections:', error)
    } finally {
      setLoadingSections(false)
    }
  }, [])

  // جلب Countries مع caching
  const refetchCountries = useCallback(async () => {
    const now = Date.now()
    
    // التحقق من الـ cache
    if (cache.countries.data && (now - cache.countries.timestamp) < cache.countries.ttl) {
      setCountries(cache.countries.data)
      
      // تحديد الدولة من subdomain إذا لم تكن محددة
      if (!selectedCountry && currentCountryCode) {
        console.log('Trying to find country by code (cached):', { currentCountryCode, countries: cache.countries.data })
        const country = cache.countries.data.find(
          (c) => (c.iso2 || c.iso_code || '').toLowerCase() === currentCountryCode.toLowerCase()
        )
        console.log('Found country (cached):', country)
        if (country) {
          setSelectedCountry(country)
        } else {
          console.warn('Country not found for code (cached):', currentCountryCode, 'Available countries:', cache.countries.data.map(c => ({ id: c.id, name: c.name, iso2: c.iso2, iso_code: c.iso_code })))
        }
      }
      return
    }

    setLoadingCountries(true)
    setErrorCountries(null)
    try {
      const data = await fetchCountries()
      cache.countries.data = data
      cache.countries.timestamp = now
      setCountries(data)

      // تحديد الدولة من subdomain
      if (currentCountryCode) {
        console.log('Trying to find country by code after fetch:', { currentCountryCode, countries: data })
        const country = data.find(
          (c) => (c.iso2 || c.iso_code || '').toLowerCase() === currentCountryCode.toLowerCase()
        )
        console.log('Found country after fetch:', country)
        if (country) {
          setSelectedCountry(country)
        } else {
          console.warn('Country not found for code after fetch:', currentCountryCode, 'Available countries:', data.map(c => ({ id: c.id, name: c.name, iso2: c.iso2, iso_code: c.iso_code })))
        }
      } else {
        console.log('No country code from subdomain')
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to fetch countries')
      setErrorCountries(err)
      console.error('Error fetching countries:', error)
    } finally {
      setLoadingCountries(false)
    }
  }, [currentCountryCode, selectedCountry])

  // جلب Cities مع caching
  const refetchCities = useCallback(async (countryId: number) => {
    const now = Date.now()
    const cached = cache.cities.get(countryId)

    // التحقق من الـ cache
    if (cached && (now - cached.timestamp) < cache.citiesTtl) {
      console.log('Using cached cities:', { countryId, cities: cached.data })
      setCities(cached.data)
      return
    }

    setLoadingCities(true)
    setErrorCities(null)
    try {
      console.log('Fetching cities for country:', countryId)
      const data = await fetchCitiesByCountryId(countryId)
      console.log('Fetched cities data:', { countryId, data, length: data.length })
      cache.cities.set(countryId, { data, timestamp: now })
      setCities(data)
      console.log('Cities state updated:', data)
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to fetch cities')
      setErrorCities(err)
      console.error('Error fetching cities:', error)
      setCities([])
    } finally {
      setLoadingCities(false)
    }
  }, [])

  // Mark component as mounted after hydration
  useEffect(() => {
    setMounted(true)
  }, [])

  // جلب البيانات عند تحميل المكون - only after mount
  useEffect(() => {
    if (mounted) {
      console.log('AppDataProvider mounted, fetching data...', { currentCountryCode })
      refetchSections()
      refetchCountries()
    }
  }, [mounted, refetchSections, refetchCountries, currentCountryCode])

  // جلب المدن عند تغيير الدولة
  useEffect(() => {
    console.log('Selected country changed:', { selectedCountry, id: selectedCountry?.id })
    if (selectedCountry) {
      refetchCities(selectedCountry.id)
    } else {
      console.log('No country selected, clearing cities')
      setCities([])
    }
  }, [selectedCountry, refetchCities])

  const value: AppDataContextType = {
    sections,
    loadingSections,
    errorSections,
    refetchSections,
    countries,
    loadingCountries,
    errorCountries,
    selectedCountry,
    setSelectedCountry,
    refetchCountries,
    cities,
    loadingCities,
    errorCities,
    refetchCities,
  }

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>
}

export function useAppData() {
  const context = useContext(AppDataContext)
  if (context === undefined) {
    throw new Error('useAppData must be used within AppDataProvider')
  }
  return context
}

