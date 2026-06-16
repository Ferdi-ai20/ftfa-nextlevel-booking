/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import { Body, Container, Head, Heading, Html, Preview, Text } from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'
import { WhatsAppFooter } from './_whatsapp-footer.tsx'

interface Props { parentName?: string; playerName?: string }

const Email = ({ parentName, playerName }: Props) => (
  <Html lang="nl" dir="ltr">
    <Head />
    <Preview>Welkom bij FTFA Academy</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Welkom!</Heading>
        <Text style={text}>Hoi{parentName ? ` ${parentName}` : ''},</Text>
        <Text style={text}>
          Goed nieuws — {playerName ?? 'de speler'} is goedgekeurd voor FTFA Academy.
        </Text>
        <Text style={text}>
          Je ontvangt zo direct een aparte e-mail van ons systeem met een uitnodigingslink om een wachtwoord aan te maken.
          Klik op die link, kies een wachtwoord, en je kunt inloggen op je dashboard en private trainingen boeken.
        </Text>
        <Text style={text}>
          Tip: kijk ook in je spam-folder als je de uitnodiging niet binnen een paar minuten ziet.
        </Text>
        <WhatsAppFooter />
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: 'Welkom bij FTFA Academy',
  displayName: 'Application approved (NL)',
  previewData: { parentName: 'Sara', playerName: 'Tim' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Inter, Arial, sans-serif' }
const container = { padding: '32px 28px', maxWidth: '560px' }
const h1 = { fontSize: '26px', fontWeight: 700, color: '#0a0a0a', textTransform: 'uppercase' as const, letterSpacing: '0.02em', margin: '0 0 20px' }
const text = { fontSize: '15px', color: '#0a0a0a', lineHeight: 1.55, margin: '0 0 16px' }
