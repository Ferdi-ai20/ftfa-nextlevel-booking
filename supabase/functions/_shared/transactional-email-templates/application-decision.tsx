/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import { Body, Container, Head, Heading, Html, Preview, Text } from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface Props { parentName?: string; playerName?: string; approved?: boolean }

const Email = ({ parentName, playerName, approved }: Props) => (
  <Html lang="nl" dir="ltr">
    <Head />
    <Preview>{approved ? 'Welkom bij FTFA Academy' : 'Bedankt voor je aanmelding'}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>{approved ? 'Welkom!' : 'Bedankt'}</Heading>
        <Text style={text}>Hi{parentName ? ` ${parentName}` : ''},</Text>
        <Text style={text}>
          {approved
            ? `${playerName ?? 'De speler'} is goedgekeurd als active player. Je kunt nu inloggen en private trainingen boeken.`
            : 'Bedankt voor de aanmelding. Op dit moment is er helaas geen plek. Je hoort het zodra dat verandert.'}
        </Text>
        <Text style={footer}>— Coach, FTFA Academy</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: 'Aanmelding FTFA Academy',
  displayName: 'Application decision',
  previewData: { parentName: 'Sara', playerName: 'Tim', approved: true },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Inter, Arial, sans-serif' }
const container = { padding: '32px 28px', maxWidth: '560px' }
const h1 = { fontSize: '26px', fontWeight: 700, color: '#0a0a0a', textTransform: 'uppercase' as const, letterSpacing: '0.02em', margin: '0 0 20px' }
const text = { fontSize: '15px', color: '#0a0a0a', lineHeight: 1.55, margin: '0 0 16px' }
const footer = { fontSize: '12px', color: '#999', margin: '32px 0 0' }
