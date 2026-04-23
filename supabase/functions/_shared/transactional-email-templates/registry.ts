/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'

export interface TemplateEntry {
  component: React.ComponentType<any>
  subject: string | ((data: Record<string, any>) => string)
  to?: string
  displayName?: string
  previewData?: Record<string, any>
}

import { template as sundayReminder } from './sunday-reminder.tsx'
import { template as bookingWindowOpen } from './booking-window-open.tsx'
import { template as bookingConfirmation } from './booking-confirmation.tsx'

export const TEMPLATES: Record<string, TemplateEntry> = {
  'sunday-reminder': sundayReminder,
  'booking-window-open': bookingWindowOpen,
  'booking-confirmation': bookingConfirmation,
}
