/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Button, Container, Head, Heading, Html, Preview, Section, Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'FTFA Academy'
const SITE_URL = 'https://www.ftfaacademy.nl'

interface Props {
  playerName?: string
  date?: string
  message?: string
}

const BookingWindowOpenEmail = ({ playerName, date, message }: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>New training slots available{date ? ` on ${date}` : ''}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>New slots available</Heading>
        <Text style={text}>Hi{playerName ? ` ${playerName}` : ''},</Text>
        <Text style={text}>
          New training slots are open{date ? ` on ${date}` : ''}. Spots are limited and assigned first-come, first-served.
        </Text>
        {message && <Text style={callout}>"{message}"</Text>}
        <Section style={{ textAlign: 'center', margin: '32px 0' }}>
          <Button href={`${SITE_URL}/dashboard`} style={button}>
            Book your slot
          </Button>
        </Section>
        <Text style={footer}>— Coach, {SITE_NAME}</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: BookingWindowOpenEmail,
  subject: (d: Record<string, any>) =>
    d.date ? `New training slots — ${d.date}` : 'New training slots available',
  displayName: 'Booking window opened',
  previewData: { playerName: 'Lucas', date: 'Saturday 3 May', message: 'Extra finishing session, 1-on-1 only.' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Inter, Arial, sans-serif' }
const container = { padding: '32px 28px', maxWidth: '560px' }
const h1 = { fontSize: '26px', fontWeight: 700, color: '#0a0a0a', textTransform: 'uppercase' as const, letterSpacing: '0.02em', margin: '0 0 20px' }
const text = { fontSize: '15px', color: '#0a0a0a', lineHeight: 1.55, margin: '0 0 16px' }
const callout = { fontSize: '14px', color: '#444', lineHeight: 1.5, margin: '16px 0', padding: '12px 16px', borderLeft: '3px solid #c4ff00', backgroundColor: '#fafafa' }
const button = { backgroundColor: '#c4ff00', color: '#0a0a0a', padding: '14px 28px', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.1em', borderRadius: '2px', textDecoration: 'none' }
const footer = { fontSize: '12px', color: '#999', margin: '32px 0 0' }
