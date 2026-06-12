/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import { Body, Container, Head, Heading, Html, Preview, Text } from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface Props { guestName?: string; date?: string; slotTime?: string; location?: string }

const Email = ({ guestName, date, slotTime, location }: Props) => (
  <Html lang="nl" dir="ltr">
    <Head />
    <Preview>Je proeftraining is bevestigd</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Proeftraining bevestigd</Heading>
        <Text style={text}>Hi{guestName ? ` ${guestName}` : ''},</Text>
        <Text style={text}>
          Top nieuws — je plek is bevestigd{date ? ` op ${date}` : ''}{slotTime ? ` om ${slotTime}` : ''}{location ? ` (${location})` : ''}. Tot dan op het veld!
        </Text>
        <Text style={footer}>— Coach, FTFA Academy</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: 'Je proeftraining is bevestigd',
  displayName: 'Booking accepted (public)',
  previewData: { guestName: 'Sara', date: 'zaterdag 14 juni', slotTime: '11:00', location: 'Sportpark' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Inter, Arial, sans-serif' }
const container = { padding: '32px 28px', maxWidth: '560px' }
const h1 = { fontSize: '26px', fontWeight: 700, color: '#0a0a0a', textTransform: 'uppercase' as const, letterSpacing: '0.02em', margin: '0 0 20px' }
const text = { fontSize: '15px', color: '#0a0a0a', lineHeight: 1.55, margin: '0 0 16px' }
const footer = { fontSize: '12px', color: '#999', margin: '32px 0 0' }
