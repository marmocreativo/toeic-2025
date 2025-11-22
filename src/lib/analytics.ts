// src/lib/analytics.ts
export const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || 'G-XXXXXXXXXX'

// Cargar Google Analytics
export const loadGoogleAnalytics = () => {
  if (typeof window !== 'undefined' && GA_MEASUREMENT_ID) {
    // Crear script tag
    const script = document.createElement('script')
    script.async = true
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`
    document.head.appendChild(script)

    // Inicializar gtag
    window.dataLayer = window.dataLayer || []
    function gtag(...args: any[]) {
      window.dataLayer.push(args)
    }
    window.gtag = gtag

    gtag('js', new Date())
    gtag('config', GA_MEASUREMENT_ID, {
      page_title: document.title,
      page_location: window.location.href,
    })
  }
}

// Rastrear página vista
export const trackPageView = (url: string) => {
  if (typeof window.gtag !== 'undefined') {
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_path: url,
    })
  }
}

// Rastrear eventos personalizados
export const trackEvent = (action: string, category: string, label?: string, value?: number) => {
  if (typeof window.gtag !== 'undefined') {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    })
  }
}

// Eventos específicos para TOEIC
export const trackExamView = (examId: number, examTitle: string) => {
  trackEvent('view_exam', 'exam', `${examId}: ${examTitle}`)
}

export const trackRegistrationStart = (examId: number) => {
  trackEvent('begin_registration', 'exam', `exam_${examId}`)
}

export const trackRegistrationComplete = (examId: number) => {
  trackEvent('complete_registration', 'exam', `exam_${examId}`)
}

export const trackCenterView = (centroId: number) => {
  trackEvent('view_center', 'center', `center_${centroId}`)
}

export const trackDownload = (fileName: string, fileType: string) => {
  trackEvent('download', 'file', `${fileType}: ${fileName}`)
}