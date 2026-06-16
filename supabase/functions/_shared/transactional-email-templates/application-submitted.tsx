/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import { Body, Container, Head, Heading, Html, Preview, Section, Text } from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface Props {
  parentName?: string; playerName?: string; email?: string; phone?: string;
  birthYear?: number | string; club?: string; team?: string; position?: string; notes?: string;
}

const Email = (p: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>New application — FTFA Academy</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>New application</Heading>
        <Text style={text}>A new player application was submitted.</Text>
        <Section style={card}>
          {p.playerName && <Text style={cardRow}><strong>Player:</strong> {p.playerName}</Text>}
          {p.birthYear && <Text style={cardRow}><strong>Birth year:</strong> {String(p.birthYear)}</Text>}
          {p.parentName && <Text style={cardRow}><strong>Parent:</strong> {p.parentName}</Text>}
          {p.email && <Text style={cardRow}><strong>Email:</strong> {p.email}</Text>}
          {p.phone && <Text style={cardRow}><strong>Phone:</strong> {p.phone}</Text>}
          {p.club && <Text style={cardRow}><strong>Club:</strong> {p.club}</Text>}
          {p.team && <Text style={cardRow}><strong>Team:</strong> {p.team}</Text>}
          {p.position && <Text style={cardRow}><strong>Position:</strong> {p.position}</Text>}
          {p.notes && <Text style={cardRow}><strong>Notes:</strong> {p.notes}</Text>}
        </Section>
        <Text style={footer}>— FTFA Academy backend</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: 'New application — FTFA Academy',
  displayName: 'Admin: new application',
  previewData: { parentName: 'Sara', playerName: 'Tim', email: 'sara@example.com', phone: '0612345678', birthYear: 2012, club: 'Olympia', team: 'JO13-1', position: 'CM', notes: 'Wil 1-op-1 trainingen' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Inter, Arial, sans-serif' }
const container = { padding: '32px 28px', maxWidth: '560px' }
const h1 = { fontSize: '24px', fontWeight: 700, color: '#0a0a0a', textTransform: 'uppercase' as const, letterSpacing: '0.02em', margin: '0 0 20px' }
const text = { fontSize: '15px', color: '#0a0a0a', lineHeight: 1.55, margin: '0 0 16px' }
const card = { backgroundColor: '#f6f6f4', padding: '14px 16px', margin: '8px 0 20px' }
const cardRow = { fontSize: '14px', color: '#0a0a0a', margin: '3px 0' }
const footer = { fontSize: '12px', color: '#999', margin: '24px 0 0' }
