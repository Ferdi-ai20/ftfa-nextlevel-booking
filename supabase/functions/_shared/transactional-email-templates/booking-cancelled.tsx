/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import { Body, Container, Head, Heading, Html, Preview, Section, Text } from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'
import { WhatsAppFooter } from './_whatsapp-footer.tsx'

interface Props {
  recipientName?: string; date?: string; slotTime?: string;
  trainingType?: string; byAdmin?: boolean; reason?: string; wasRequest?: boolean;
}

const Email = ({ recipientName, date, slotTime, trainingType, byAdmin, reason, wasRequest }: Props) => (
  <Html lang="nl" dir="ltr">
    <Head />
    <Preview>{wasRequest ? 'Je aanvraag bij FTFA is niet geplaatst' : 'Boeking geannuleerd'}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>{wasRequest ? 'Aanvraag niet geplaatst' : 'Boeking geannuleerd'}</Heading>
        <Text style={text}>Hoi{recipientName ? ` ${recipientName}` : ''},</Text>
        <Text style={text}>
          {wasRequest
            ? `Je aanvraag${date ? ` voor ${date}` : ''}${slotTime ? ` om ${slotTime}` : ''} is helaas niet geplaatst. Dit plekje gaat niet naar jou toe, maar hou de site in de gaten voor nieuwe open trainingen.`
            : byAdmin
            ? `Je training${date ? ` op ${date}` : ''}${slotTime ? ` om ${slotTime}` : ''} is geannuleerd door de coach.`
            : `Je boeking${date ? ` op ${date}` : ''}${slotTime ? ` om ${slotTime}` : ''} is geannuleerd.`}
        </Text>
        <Section style={card}>
          {date && <Text style={cardRow}><strong>Datum:</strong> {date}</Text>}
          {slotTime && <Text style={cardRow}><strong>Tijd:</strong> {slotTime}</Text>}
          {trainingType && <Text style={cardRow}><strong>Training:</strong> {trainingType}</Text>}
        </Section>
        {reason && <Text style={text}>Reden: {reason}</Text>}
        <WhatsAppFooter />
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: (data: { wasRequest?: boolean }) => data?.wasRequest ? 'Je aanvraag bij FTFA is niet geplaatst' : 'Boeking geannuleerd',
  displayName: 'Booking cancelled (NL)',
  previewData: { recipientName: 'Lucas', date: 'zaterdag 14 juni', slotTime: '11:00', trainingType: '1-op-1', byAdmin: true },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Inter, Arial, sans-serif' }
const container = { padding: '32px 28px', maxWidth: '560px' }
const h1 = { fontSize: '26px', fontWeight: 700, color: '#0a0a0a', textTransform: 'uppercase' as const, letterSpacing: '0.02em', margin: '0 0 20px' }
const text = { fontSize: '15px', color: '#0a0a0a', lineHeight: 1.55, margin: '0 0 16px' }
const card = { backgroundColor: '#f6f6f4', padding: '16px 18px', margin: '8px 0 20px', borderLeft: '3px solid #0a0a0a' }
const cardRow = { fontSize: '14px', color: '#0a0a0a', margin: '4px 0' }
