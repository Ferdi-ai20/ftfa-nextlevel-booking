/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import { Body, Container, Head, Heading, Html, Preview, Text } from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface Props { recipientName?: string; date?: string; slotTime?: string; byAdmin?: boolean; reason?: string }

const Email = ({ recipientName, date, slotTime, byAdmin, reason }: Props) => (
  <Html lang="nl" dir="ltr">
    <Head />
    <Preview>Boeking geannuleerd</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Boeking geannuleerd</Heading>
        <Text style={text}>Hi{recipientName ? ` ${recipientName}` : ''},</Text>
        <Text style={text}>
          {byAdmin
            ? `Je training${date ? ` op ${date}` : ''}${slotTime ? ` om ${slotTime}` : ''} is geannuleerd door de coach.`
            : `Je boeking${date ? ` op ${date}` : ''}${slotTime ? ` om ${slotTime}` : ''} is geannuleerd.`}
        </Text>
        {reason && <Text style={text}>Reden: {reason}</Text>}
        <Text style={footer}>— FTFA Academy</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: 'Boeking geannuleerd',
  displayName: 'Booking cancelled',
  previewData: { recipientName: 'Lucas', date: 'zaterdag 14 juni', slotTime: '11:00', byAdmin: true },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Inter, Arial, sans-serif' }
const container = { padding: '32px 28px', maxWidth: '560px' }
const h1 = { fontSize: '26px', fontWeight: 700, color: '#0a0a0a', textTransform: 'uppercase' as const, letterSpacing: '0.02em', margin: '0 0 20px' }
const text = { fontSize: '15px', color: '#0a0a0a', lineHeight: 1.55, margin: '0 0 16px' }
const footer = { fontSize: '12px', color: '#999', margin: '32px 0 0' }
