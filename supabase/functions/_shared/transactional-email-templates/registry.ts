/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'

export interface TemplateEntry {
  component: React.ComponentType<any>
  subject: string | ((data: Record<string, any>) => string)
  to?: string
  displayName?: string
  previewData?: Record<string, any>
}

import { template as bookingConfirmed } from './booking-confirmed.tsx'
import { template as bookingRequested } from './booking-requested.tsx'
import { template as bookingCancelled } from './booking-cancelled.tsx'
import { template as bookingReminder24h } from './booking-reminder-24h.tsx'
import { template as applicationApproved } from './application-approved.tsx'
import { template as applicationRejected } from './application-rejected.tsx'
import { template as applicationSubmitted } from './application-submitted.tsx'
import { template as adminNewBooking } from './admin-new-booking.tsx'
import { template as adminBookingCancelled } from './admin-booking-cancelled.tsx'
import { template as adminInviteSent } from './admin-invite-sent.tsx'

export const TEMPLATES: Record<string, TemplateEntry> = {
  'booking-confirmed': bookingConfirmed,
  'booking-requested': bookingRequested,
  'booking-cancelled': bookingCancelled,
  'booking-reminder-24h': bookingReminder24h,
  'application-approved': applicationApproved,
  'application-rejected': applicationRejected,
  'application-submitted': applicationSubmitted,
  'admin-new-booking': adminNewBooking,
  'admin-booking-cancelled': adminBookingCancelled,
  'admin-invite-sent': adminInviteSent,
}
