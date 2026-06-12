/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import { Body, Container, Head, Heading, Html, Preview, Text } from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface Props {
  who?: string
  date?: string
  slotTime?: string
  trainingType?: string
  needsReview?: boolean
  contact?: string
}

const Email = ({ who, date, slotTime, trainingType, needsReview, contact }: Props) => (
  <Html lang="nl" dir="ltr">
    <Head />
    <Preview>{needsReview ? 'Nieuwe aanvraag wacht op review' : 'Nieuwe boeking'}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>{needsReview ? 'Nieuwe aanvraag' : 'Nieuwe boeking'}</Heading>
        <Text style={text}>
          {who ?? 'Iemand'} {needsReview ? 'heeft een aanvraag ingediend' : 'heeft geboekt'}{date ? ` voor ${date}` : ''}{slotTime ? ` om ${slotTime}` : ''}{trainingType ? ` — ${trainingType}` : ''}.
        </Text>
        {contact && <Text style={text}>Contact: {contact}</Text>}
        <Text style={footer}>— FTFA Academy</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: 'Nieuwe boeking — FTFA Academy',
  displayName: 'Admin notification (new booking)',
  previewData: { who: 'Sara (ouder van Tim)', date: 'zaterdag 14 juni', slotTime: '11:00', trainingType: 'Proeftraining', needsReview: true, contact: 'sara@example.com' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Inter, Arial, sans-serif' }
const container = { padding: '32px 28px', maxWidth: '560px' }
const h1 = { fontSize: '26px', fontWeight: 700, color: '#0a0a0a', textTransform: 'uppercase' as const, letterSpacing: '0.02em', margin: '0 0 20px' }
const text = { fontSize: '15px', color: '#0a0a0a', lineHeight: 1.55, margin: '0 0 16px' }
const footer = { fontSize: '12px', color: '#999', margin: '32px 0 0' }
