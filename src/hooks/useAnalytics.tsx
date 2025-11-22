// src/hooks/useAnalytics.tsx
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { trackPageView } from '../lib/analytics'

export const useAnalytics = () => {
  const location = useLocation()

  useEffect(() => {
    if (import.meta.env.PROD) {
      trackPageView(location.pathname)
    }
  }, [location.pathname])
}