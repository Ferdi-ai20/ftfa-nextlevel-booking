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
  trainingType?: string
  location?: string
}

const Email = ({ playerName, date, slotTime, trainingType, location }: Props) => (
  <Html lang="nl" dir="ltr">
    <Head />
    <Preview>Je training is bevestigd</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Training bevestigd</Heading>
        <Text style={text}>Hi{playerName ? ` ${playerName}` : ''},</Text>
        <Text style={text}>
          Je training is bevestigd{date ? ` op ${date}` : ''}{slotTime ? ` om ${slotTime}` : ''}{trainingType ? ` — ${trainingType}` : ''}{location ? ` (${location})` : ''}. Tot dan!
        </Text>
        <Text style={footer}>— Coach, {SITE_NAME}</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: 'Je training is bevestigd',
  displayName: 'Booking confirmed (private)',
  previewData: { playerName: 'Lucas', date: 'zaterdag 14 juni', slotTime: '11:00', trainingType: '1-op-1', location: 'Sportpark' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Inter, Arial, sans-serif' }
const container = { padding: '32px 28px', maxWidth: '560px' }
const h1 = { fontSize: '26px', fontWeight: 700, color: '#0a0a0a', textTransform: 'uppercase' as const, letterSpacing: '0.02em', margin: '0 0 20px' }
const text = { fontSize: '15px', color: '#0a0a0a', lineHeight: 1.55, margin: '0 0 16px' }
const footer = { fontSize: '12px', color: '#999', margin: '32px 0 0' }
