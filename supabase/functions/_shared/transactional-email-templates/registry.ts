/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'

export interface TemplateEntry {
  component: React.ComponentType<any>
  subject: string | ((data: Record<string, any>) => string)
  to?: string
  displayName?: string
  previewData?: Record<string, any>
}

import { template as bookingConfirmation } from './booking-confirmation.tsx'
import { template as bookingConfirmedPrivate } from './booking-confirmed-private.tsx'


import { template as bookingCancelled } from './booking-cancelled.tsx'
import { template as adminNewBooking } from './admin-new-booking.tsx'
import { template as applicationDecision } from './application-decision.tsx'
import { template as adminApplicationApproved } from './admin-application-approved.tsx'

export const TEMPLATES: Record<string, TemplateEntry> = {
  'booking-confirmation': bookingConfirmation,
  'booking-confirmed-private': bookingConfirmedPrivate,
  'booking-cancelled': bookingCancelled,
  'admin-new-booking': adminNewBooking,
  'application-decision': applicationDecision,
  'admin-application-approved': adminApplicationApproved,
}
