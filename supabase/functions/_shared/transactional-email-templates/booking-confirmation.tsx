/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Hr, Html, Link, Preview, Section, Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'FTFA Academy'

interface Props {
  playerName?: string
  parentName?: string
  date?: string
  slotTime?: string
  trainingType?: string
  location?: string
}

const Email = ({ playerName, parentName, date, slotTime, trainingType, location }: Props) => (
  <Html lang="nl" dir="ltr">
    <Head />
    <Preview>Je training bij FTFA is bevestigd</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Boeking bevestigd</Heading>
        <Text style={text}>Hoi{parentName ? ` ${parentName}` : ''},</Text>
        <Text style={text}>
          Je boeking{playerName ? ` voor ${playerName}` : ''} bij {SITE_NAME} is bevestigd.
        </Text>

        <Section style={card}>
          {date && <Text style={cardRow}><strong>Datum:</strong> {date}</Text>}
          {slotTime && <Text style={cardRow}><strong>Tijd:</strong> {slotTime}</Text>}
          {trainingType && <Text style={cardRow}><strong>Training:</strong> {trainingType}</Text>}
          {location && <Text style={cardRow}><strong>Locatie:</strong> {location}</Text>}
        </Section>

        <Text style={text}>
          Zorg dat je 10 minuten voor aanvang aanwezig bent met passende voetbalkleding en bidon.
        </Text>

        <Hr style={hr} />

        <Text style={whatsapp}>
          Voor vragen of last-minute wijzigingen, neem contact op met Ferdi via WhatsApp:{' '}
          <Link href="https://wa.me/31621275348" style={waLink}>+31 6 21 27 53 48</Link>
        </Text>

        <Text style={footer}>— Ferdi, {SITE_NAME}</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: 'Je training bij FTFA is bevestigd',
  displayName: 'Booking confirmed (NL)',
  previewData: {
    parentName: 'Sara',
    playerName: 'Tim',
    date: 'zaterdag 21 juni',
    slotTime: '11:00',
    trainingType: '1-op-1',
    location: 'Sportpark Olympia',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Inter, Arial, sans-serif' }
const container = { padding: '32px 28px', maxWidth: '560px' }
const h1 = { fontSize: '26px', fontWeight: 700, color: '#0a0a0a', textTransform: 'uppercase' as const, letterSpacing: '0.02em', margin: '0 0 20px' }
const text = { fontSize: '15px', color: '#0a0a0a', lineHeight: 1.55, margin: '0 0 16px' }
const card = { backgroundColor: '#f6f6f4', padding: '16px 18px', margin: '8px 0 20px', borderLeft: '3px solid #0a0a0a' }
const cardRow = { fontSize: '14px', color: '#0a0a0a', margin: '4px 0' }
const hr = { borderColor: '#e5e5e5', margin: '24px 0' }
const whatsapp = { fontSize: '13px', color: '#0a0a0a', lineHeight: 1.55, margin: '0 0 16px' }
const waLink = { color: '#25D366', fontWeight: 600, textDecoration: 'none' }
const footer = { fontSize: '12px', color: '#999', margin: '24px 0 0' }
