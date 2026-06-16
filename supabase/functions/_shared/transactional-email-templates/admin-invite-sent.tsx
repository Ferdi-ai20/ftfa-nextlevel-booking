/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import { Body, Container, Head, Heading, Html, Preview, Text } from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface Props { parentName?: string; playerName?: string; email?: string }

const Email = ({ parentName, playerName, email }: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Invite sent — FTFA Academy</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Invite sent</Heading>
        <Text style={text}>
          Application approved for player <strong>{playerName ?? '—'}</strong>
          {parentName ? ` (parent ${parentName})` : ''}.
        </Text>
        <Text style={text}>
          Supabase invite email was sent to <strong>{email}</strong>. The user will set a password and gain dashboard access.
        </Text>
        <Text style={footer}>— FTFA Academy backend</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: 'Invite sent — FTFA Academy',
  displayName: 'Admin: invite sent',
  previewData: { parentName: 'Sara', playerName: 'Tim', email: 'sara@example.com' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Inter, Arial, sans-serif' }
const container = { padding: '32px 28px', maxWidth: '560px' }
const h1 = { fontSize: '24px', fontWeight: 700, color: '#0a0a0a', textTransform: 'uppercase' as const, letterSpacing: '0.02em', margin: '0 0 20px' }
const text = { fontSize: '15px', color: '#0a0a0a', lineHeight: 1.55, margin: '0 0 16px' }
const footer = { fontSize: '12px', color: '#999', margin: '24px 0 0' }
