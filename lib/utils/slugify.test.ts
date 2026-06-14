import { describe, expect, it } from 'vitest'
import { slugify } from './slugify'

describe('slugify', () => {
  it('lowercases and hyphenates spaces', () => {
    expect(slugify('Hello World')).toBe('hello-world')
  })

  it('removes special characters', () => {
    expect(slugify('Ender Lilies: Quietus of the Knights')).toBe(
      'ender-lilies-quietus-of-the-knights'
    )
  })

  it('collapses multiple spaces', () => {
    expect(slugify('foo   bar')).toBe('foo-bar')
  })

  it('trims leading and trailing whitespace', () => {
    expect(slugify('  foo  ')).toBe('foo')
  })

  it('handles underscores like spaces', () => {
    expect(slugify('foo_bar')).toBe('foo-bar')
  })

  it('removes leading and trailing hyphens', () => {
    expect(slugify('-foo-')).toBe('foo')
  })

  it('handles empty string', () => {
    expect(slugify('')).toBe('')
  })

  it('preserves numbers', () => {
    expect(slugify('Hollow Knight 2')).toBe('hollow-knight-2')
  })
})
