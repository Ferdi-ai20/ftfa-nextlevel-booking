/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import { Body, Container, Head, Heading, Html, Preview, Text } from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface Props { parentName?: string; playerName?: string; email?: string }

const Email = ({ parentName, playerName, email }: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Application approved & invite sent</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Application approved</Heading>
        <Text style={text}>
          {parentName ?? 'Parent'} ({email}) was approved for player {playerName ?? '—'}.
        </Text>
        <Text style={text}>
          A Supabase invite email has been sent to {email}. Once they set a password they can log in and book private slots.
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: 'FTFA · Application approved & invite sent',
  displayName: 'Admin: application approved',
  previewData: { parentName: 'Sara', playerName: 'Tim', email: 'sara@example.com' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Inter, Arial, sans-serif' }
const container = { padding: '32px 28px', maxWidth: '560px' }
const h1 = { fontSize: '22px', fontWeight: 700, color: '#0a0a0a', margin: '0 0 16px' }
const text = { fontSize: '14px', color: '#0a0a0a', lineHeight: 1.55, margin: '0 0 14px' }
