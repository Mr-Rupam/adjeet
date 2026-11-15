import { describe, expect, it } from 'vitest'
import { containsLink } from '@/lib/link-filter'
import { leadSchema } from '@/lib/lead-schema'

const brief = { name: 'Buyer Name', phone: '9876543210', city: 'Siliguri', serviceInterest: ['glow-sign-boards'], timeline: 'exploring', cfTurnstileResponse: 'test' }

describe('containsLink: what it catches', () => {
  it.each([
    ['a scheme link', 'see https://example.com/shop'],
    ['an upper-case scheme', 'HTTP://example.com'],
    ['a mixed-case scheme', 'HtTpS://example.com'],
    ['a defanged scheme', 'hxxps://example.com'],
    ['a spaced scheme', 'http ://example.com'],
    ['a bracketed colon', 'http[:]//example.com'],
    ['an ftp link', 'ftp://files.example.com'],
    ['a protocol-relative link', 'go to //example.com/x'],
    ['www', 'visit www.example.com'],
    ['upper-case WWW', 'visit WWW.Example.com'],
    ['numbered www', 'visit www2.example.com'],
    ['www with no tld', 'visit www.shopname'],
    ['a bare .com', 'our site is example.com'],
    ['a bare .in', 'order at example.in today'],
    ['a bare .co.in', 'order at example.co.in today'],
    ['a short link', 'bit.ly/3abc'],
    ['a WhatsApp link', 'wa.me/919876543210'],
    ['a Telegram link', 'join telegram.me/offers'],
    ['an upper-case domain', 'EXAMPLE.COM'],
    ['a subdomain', 'shop.example.org'],
    ['a domain in brackets-dot form', 'example[.]com'],
    ['a domain in parentheses-dot form', 'example(.)com'],
    ['a domain in dot-word form', 'example[dot]com'],
    ['a full-width domain', 'ｅｘａｍｐｌｅ．ｃｏｍ'],
    ['an ideographic full stop', 'example。com'],
    ['a zero-width space inside the name', 'exam​ple.com'],
    ['a domain after Bengali text', 'দোকান example.xyz'],
    ['a link with a path and query', 'example.com/a?b=1'],
    ['a link at the very start', 'example.com is the site'],
    ['a link on its own line', 'Hello\nexample.net\nthanks'],
  ])('%s', (_label, text) => {
    expect(containsLink(text)).toBe(true)
  })
})

describe('containsLink: what it leaves alone', () => {
  it.each([
    ['empty text', ''],
    ['plain English', 'I need a glow sign board for my new shop in Hill Cart Road.'],
    ['Bengali text', 'আমার দোকানের জন্য একটি সাইনবোর্ড দরকার।'],
    ['Hindi text', 'मुझे अपनी दुकान के लिए बोर्ड चाहिए।'],
    ['initials with dots', 'S.K. Traders, M.G. Road'],
    ['a company suffix', 'Sharma & Co. Pvt. Ltd. needs a sign'],
    ['a name run into a suffix', 'Sharma Co.Ltd'],
    ['a title with a dot', 'Dr. Sen Clinic and Mr. Das Stores'],
    ['no space after a title', 'Mr.Das Stores'],
    ['a size', 'about 4.5 ft by 10 ft, 3.5 m high'],
    ['a size in inches typed with a dot', 'make it 12.in tall'],
    ['a year typed with a dot', 'for 2026.co'],
    ['a date', 'before 15.11.2026'],
    ['a time with dots', 'call after 5 p.m. please'],
    ['a version of a sentence run together', 'We need a board.In Siliguri'],
    ['a word that merely starts like a domain ending', 'a sign.India'],
    ['a word that merely starts like a domain ending, upper case', 'SIGN.INDIA'],
    ['an email address', 'Reply to name@example.com please'],
    ['an email address on a .in domain', 'write to owner@shop.co.in'],
    ['an email whose name looks like a domain', 'john.com@example.org'],
    ['a phone number', 'call 98765 43210 or +91 98765-43210'],
    ['a price-free budget note', 'Budget is flexible. Rs. is fine'],
    ['a colon and slashes in other uses', 'Timings: 10/12'],
    ['a scheme-like word with a colon only', 'Note: bring the old board'],
    ['an ellipsis', 'maybe...we will see'],
  ])('%s', (_label, text) => {
    expect(containsLink(text)).toBe(false)
  })
})

describe('the lead message', () => {
  const message = (value: string) => leadSchema.safeParse({ ...brief, message: value })

  it('accepts a normal message with shop names and dots', () => {
    expect(message('New shopfront for S.K. Traders Pvt. Ltd., M.G. Road. Size about 4.5 ft.').success).toBe(true)
  })

  it('accepts an empty message and none at all', () => {
    expect(message('').success).toBe(true)
    expect(leadSchema.safeParse(brief).success).toBe(true)
  })

  it.each(['https://example.com', 'HTTP://example.com', 'www.example.com', 'example.com', 'hxxp://example.com', 'bit.ly/abc'])(
    'rejects %s with a message that names what to remove',
    value => {
      const result = message(`Please see ${value} for details`)
      expect(result.success).toBe(false)
      expect(result.error?.issues[0].message).toBe('Please remove any links or web addresses from your message, then send again')
    },
  )
})
