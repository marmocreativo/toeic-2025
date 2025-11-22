// src/types/gtag.d.ts
declare global {
  interface Window {
    dataLayer: any[]
    gtag: (
      command: 'config' | 'set' | 'event' | 'js',
      targetId: string | Date,
      config?: {
        page_title?: string
        page_location?: string
        page_path?: string
        event_category?: string
        event_label?: string
        value?: number
        [key: string]: any
      }
    ) => void
  }
}

export {}