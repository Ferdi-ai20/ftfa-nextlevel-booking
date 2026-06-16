/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import { Body, Container, Head, Heading, Html, Preview, Section, Text } from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface Props {
  who?: string; contact?: string; date?: string; slotTime?: string;
  trainingType?: string; location?: string;
  cancelledBy?: string; cancelledAt?: string; reason?: string;
}

const Email = (p: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Booking cancelled — FTFA Academy</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Booking cancelled</Heading>
        <Text style={text}>A booking was cancelled.</Text>
        <Section style={card}>
          {p.who && <Text style={cardRow}><strong>Who:</strong> {p.who}</Text>}
          {p.contact && <Text style={cardRow}><strong>Contact:</strong> {p.contact}</Text>}
          {p.date && <Text style={cardRow}><strong>Date:</strong> {p.date}</Text>}
          {p.slotTime && <Text style={cardRow}><strong>Time:</strong> {p.slotTime}</Text>}
          {p.trainingType && <Text style={cardRow}><strong>Type:</strong> {p.trainingType}</Text>}
          {p.location && <Text style={cardRow}><strong>Location:</strong> {p.location}</Text>}
          {p.cancelledBy && <Text style={cardRow}><strong>Cancelled by:</strong> {p.cancelledBy}</Text>}
          {p.cancelledAt && <Text style={cardRow}><strong>Cancelled at:</strong> {p.cancelledAt}</Text>}
          {p.reason && <Text style={cardRow}><strong>Reason:</strong> {p.reason}</Text>}
        </Section>
        <Text style={footer}>— FTFA Academy backend</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: 'Booking cancelled — FTFA Academy',
  displayName: 'Admin: booking cancelled',
  previewData: { who: 'Sara (parent of Tim)', contact: 'sara@example.com', date: 'Saturday 21 June', slotTime: '11:00', trainingType: '1-on-1', cancelledBy: 'player', cancelledAt: '2026-06-19 14:32' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Inter, Arial, sans-serif' }
const container = { padding: '32px 28px', maxWidth: '560px' }
const h1 = { fontSize: '24px', fontWeight: 700, color: '#0a0a0a', textTransform: 'uppercase' as const, letterSpacing: '0.02em', margin: '0 0 20px' }
const text = { fontSize: '15px', color: '#0a0a0a', lineHeight: 1.55, margin: '0 0 16px' }
const card = { backgroundColor: '#f6f6f4', padding: '14px 16px', margin: '8px 0 20px' }
const cardRow = { fontSize: '14px', color: '#0a0a0a', margin: '3px 0' }
const footer = { fontSize: '12px', color: '#999', margin: '24px 0 0' }
