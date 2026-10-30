/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import { Body, Container, Head, Heading, Html, Preview, Section, Text } from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface Props {
  who?: string; date?: string; slotTime?: string; trainingType?: string;
  location?: string; contact?: string; phone?: string;
  bookingType?: 'guest' | 'player'; visibility?: string;
  birthYear?: number | string; club?: string; team?: string; position?: string;
  pending?: boolean;
}

const Email = (p: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>{p.pending ? 'New booking request — needs your approval' : 'New booking — FTFA Academy'}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>{p.pending ? 'New booking request' : 'New booking'}</Heading>
        {p.pending && (
          <Section style={badge}>
            <Text style={badgeText}>Needs your approval in the admin dashboard</Text>
          </Section>
        )}
        <Text style={text}>
          {p.who ?? 'Someone'} {p.pending ? 'requested' : 'booked'} a slot{p.date ? ` on ${p.date}` : ''}{p.slotTime ? ` at ${p.slotTime}` : ''}.
        </Text>
        <Section style={card}>
          {p.trainingType && <Text style={cardRow}><strong>Type:</strong> {p.trainingType}</Text>}
          {p.location && <Text style={cardRow}><strong>Location:</strong> {p.location}</Text>}
          {p.visibility && <Text style={cardRow}><strong>Visibility:</strong> {p.visibility}</Text>}
          {p.contact && <Text style={cardRow}><strong>Email:</strong> {p.contact}</Text>}
          {p.phone && <Text style={cardRow}><strong>Phone:</strong> {p.phone}</Text>}
          {p.birthYear && <Text style={cardRow}><strong>Birth year:</strong> {String(p.birthYear)}</Text>}
          {p.club && <Text style={cardRow}><strong>Club:</strong> {p.club}</Text>}
          {p.team && <Text style={cardRow}><strong>Team:</strong> {p.team}</Text>}
          {p.position && <Text style={cardRow}><strong>Position:</strong> {p.position}</Text>}
          {p.bookingType && <Text style={cardRow}><strong>Source:</strong> {p.bookingType === 'guest' ? 'Guest (public slot)' : 'Active player (private slot)'}</Text>}
        </Section>
        <Text style={footer}>— FTFA Academy backend</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: (data: { pending?: boolean }) => data?.pending ? 'New booking request — needs your approval — FTFA Academy' : 'New booking — FTFA Academy',
  displayName: 'Admin: new booking',
  previewData: { who: 'Sara (parent of Tim)', date: 'Saturday 21 June', slotTime: '11:00', trainingType: '1-on-1', location: 'Sportpark Olympia', contact: 'sara@example.com', phone: '0612345678', bookingType: 'guest', pending: true },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Inter, Arial, sans-serif' }
const container = { padding: '32px 28px', maxWidth: '560px' }
const h1 = { fontSize: '24px', fontWeight: 700, color: '#0a0a0a', textTransform: 'uppercase' as const, letterSpacing: '0.02em', margin: '0 0 20px' }
const badge = { backgroundColor: '#fef3e2', padding: '8px 12px', margin: '0 0 16px', borderLeft: '3px solid #b4690e' }
const badgeText = { fontSize: '12px', fontWeight: 700, color: '#b4690e', textTransform: 'uppercase' as const, letterSpacing: '0.04em', margin: 0 }
const text = { fontSize: '15px', color: '#0a0a0a', lineHeight: 1.55, margin: '0 0 16px' }
const card = { backgroundColor: '#f6f6f4', padding: '14px 16px', margin: '8px 0 20px' }
const cardRow = { fontSize: '14px', color: '#0a0a0a', margin: '3px 0' }
const footer = { fontSize: '12px', color: '#999', margin: '24px 0 0' }
