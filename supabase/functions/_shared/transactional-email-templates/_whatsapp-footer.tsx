/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import { Hr, Link, Text } from 'npm:@react-email/components@0.0.22'

export const WhatsAppFooter = () => (
  <>
    <Hr style={{ borderColor: '#e5e5e5', margin: '24px 0' }} />
    <Text style={{ fontSize: '13px', color: '#0a0a0a', lineHeight: 1.55, margin: '0 0 12px' }}>
      Voor vragen of last-minute wijzigingen, neem contact op met Ferdi via WhatsApp:{' '}
      <Link href="https://wa.me/31621275348" style={{ color: '#25D366', fontWeight: 600, textDecoration: 'none' }}>
        +31 6 21 27 53 48
      </Link>
    </Text>
    <Text style={{ fontSize: '12px', color: '#999', margin: '16px 0 0' }}>— Ferdi, FTFA Academy</Text>
  </>
)
