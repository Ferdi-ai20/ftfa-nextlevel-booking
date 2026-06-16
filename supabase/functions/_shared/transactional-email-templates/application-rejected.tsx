/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import { Body, Container, Head, Heading, Html, Preview, Text } from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'
import { WhatsAppFooter } from './_whatsapp-footer.tsx'

interface Props { parentName?: string; playerName?: string }

const Email = ({ parentName, playerName }: Props) => (
  <Html lang="nl" dir="ltr">
    <Head />
    <Preview>Bedankt voor je aanmelding bij FTFA</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Bedankt</Heading>
        <Text style={text}>Hoi{parentName ? ` ${parentName}` : ''},</Text>
        <Text style={text}>
          Bedankt voor de aanmelding{playerName ? ` van ${playerName}` : ''} bij FTFA Academy.
        </Text>
        <Text style={text}>
          Helaas is je aanmelding op dit moment niet goedgekeurd. Ferdi neemt contact met je op als er in de toekomst ruimte is.
        </Text>
        <WhatsAppFooter />
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: 'Aanmelding FTFA Academy',
  displayName: 'Application rejected (NL)',
  previewData: { parentName: 'Sara', playerName: 'Tim' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Inter, Arial, sans-serif' }
const container = { padding: '32px 28px', maxWidth: '560px' }
const h1 = { fontSize: '26px', fontWeight: 700, color: '#0a0a0a', textTransform: 'uppercase' as const, letterSpacing: '0.02em', margin: '0 0 20px' }
const text = { fontSize: '15px', color: '#0a0a0a', lineHeight: 1.55, margin: '0 0 16px' }
