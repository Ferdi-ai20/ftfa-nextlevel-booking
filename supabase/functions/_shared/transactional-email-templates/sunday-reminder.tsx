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
  sessionDate?: string
  slotTime?: string
  isFinal?: boolean
}

const SundayReminderEmail = ({ playerName, sessionDate, slotTime, isFinal }: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>
      {isFinal ? 'Final reminder — confirm Sunday training' : 'Confirm your Sunday training'}
    </Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>
          {isFinal ? 'Final reminder' : 'Confirm Sunday training'}
        </Heading>
        <Text style={text}>
          Hi{playerName ? ` ${playerName}` : ''},
        </Text>
        <Text style={text}>
          {isFinal
            ? `This is the final reminder to confirm your fixed Sunday slot${slotTime ? ` at ${slotTime}` : ''}${sessionDate ? ` on ${sessionDate}` : ''}. The deadline is Wednesday 20:00 — after that, your response is locked.`
            : `Please let us know whether you'll attend your fixed Sunday slot${slotTime ? ` at ${slotTime}` : ''}${sessionDate ? ` on ${sessionDate}` : ''}.`}
        </Text>
        <Section style={{ textAlign: 'center', margin: '32px 0' }}>
          <Button href={`${SITE_URL}/dashboard`} style={button}>
            Confirm attendance
          </Button>
        </Section>
        <Text style={muted}>
          Three options: ✅ Attending · ❌ Not attending · ⏰ Available at a different time.
        </Text>
        <Text style={footer}>— Coach, {SITE_NAME}</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: SundayReminderEmail,
  subject: (d: Record<string, any>) =>
    d.isFinal ? 'Final reminder: confirm Sunday training' : 'Confirm your Sunday training',
  displayName: 'Sunday confirmation reminder',
  previewData: { playerName: 'Lucas', sessionDate: 'Sunday 27 April', slotTime: '14:00', isFinal: false },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Inter, Arial, sans-serif' }
const container = { padding: '32px 28px', maxWidth: '560px' }
const h1 = { fontSize: '26px', fontWeight: 700, color: '#0a0a0a', textTransform: 'uppercase' as const, letterSpacing: '0.02em', margin: '0 0 20px' }
const text = { fontSize: '15px', color: '#0a0a0a', lineHeight: 1.55, margin: '0 0 16px' }
const muted = { fontSize: '13px', color: '#666', lineHeight: 1.5, margin: '0 0 8px' }
const button = { backgroundColor: '#c4ff00', color: '#0a0a0a', padding: '14px 28px', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.1em', borderRadius: '2px', textDecoration: 'none' }
const footer = { fontSize: '12px', color: '#999', margin: '32px 0 0' }
