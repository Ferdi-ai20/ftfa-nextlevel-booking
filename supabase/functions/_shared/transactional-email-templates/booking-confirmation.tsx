/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'FTFA Academy'

interface Props {
  playerName?: string
  date?: string
  slotTime?: string
}

const BookingConfirmationEmail = ({ playerName, date, slotTime }: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your training slot is confirmed</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Booking confirmed</Heading>
        <Text style={text}>Hi{playerName ? ` ${playerName}` : ''},</Text>
        <Text style={text}>
          Your training slot is confirmed{date ? ` for ${date}` : ''}{slotTime ? ` at ${slotTime}` : ''}. See you on the pitch.
        </Text>
        <Text style={footer}>— Coach, {SITE_NAME}</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: BookingConfirmationEmail,
  subject: 'Your training slot is confirmed',
  displayName: 'Booking confirmation',
  previewData: { playerName: 'Lucas', date: 'Saturday 3 May', slotTime: '11:00' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Inter, Arial, sans-serif' }
const container = { padding: '32px 28px', maxWidth: '560px' }
const h1 = { fontSize: '26px', fontWeight: 700, color: '#0a0a0a', textTransform: 'uppercase' as const, letterSpacing: '0.02em', margin: '0 0 20px' }
const text = { fontSize: '15px', color: '#0a0a0a', lineHeight: 1.55, margin: '0 0 16px' }
const footer = { fontSize: '12px', color: '#999', margin: '32px 0 0' }
