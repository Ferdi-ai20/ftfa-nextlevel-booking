/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import { Body, Container, Head, Heading, Html, Preview, Section, Text } from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface Props {
  who?: string
  date?: string
  slotTime?: string
  trainingType?: string
  location?: string
  contact?: string
  bookingType?: 'guest' | 'player'
}

const Email = ({ who, date, slotTime, trainingType, location, contact, bookingType }: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>New booking — FTFA Academy</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>New booking</Heading>
        <Text style={text}>
          {who ?? 'Someone'} booked a slot{date ? ` on ${date}` : ''}{slotTime ? ` at ${slotTime}` : ''}.
        </Text>
        <Section style={card}>
          {trainingType && <Text style={cardRow}><strong>Type:</strong> {trainingType}</Text>}
          {location && <Text style={cardRow}><strong>Location:</strong> {location}</Text>}
          {contact && <Text style={cardRow}><strong>Contact:</strong> {contact}</Text>}
          {bookingType && <Text style={cardRow}><strong>Source:</strong> {bookingType === 'guest' ? 'Guest (public slot)' : 'Active player (private slot)'}</Text>}
        </Section>
        <Text style={footer}>— FTFA Academy backend</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: 'New booking — FTFA Academy',
  displayName: 'Admin: new booking',
  previewData: { who: 'Sara (parent of Tim)', date: 'Saturday 21 June', slotTime: '11:00', trainingType: '1-on-1', location: 'Sportpark Olympia', contact: 'sara@example.com · 0612345678', bookingType: 'guest' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Inter, Arial, sans-serif' }
const container = { padding: '32px 28px', maxWidth: '560px' }
const h1 = { fontSize: '24px', fontWeight: 700, color: '#0a0a0a', textTransform: 'uppercase' as const, letterSpacing: '0.02em', margin: '0 0 20px' }
const text = { fontSize: '15px', color: '#0a0a0a', lineHeight: 1.55, margin: '0 0 16px' }
const card = { backgroundColor: '#f6f6f4', padding: '14px 16px', margin: '8px 0 20px' }
const cardRow = { fontSize: '14px', color: '#0a0a0a', margin: '3px 0' }
const footer = { fontSize: '12px', color: '#999', margin: '24px 0 0' }
