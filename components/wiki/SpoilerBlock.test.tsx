import { render, screen, fireEvent, act } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { SpoilerBlock } from './SpoilerBlock'

// ---------------------------------------------------------------------------
// localStorage mock
// ---------------------------------------------------------------------------
const storageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
  }
})()

Object.defineProperty(global, 'localStorage', { value: storageMock, writable: true })

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('SpoilerBlock', () => {
  beforeEach(() => {
    storageMock.clear()
  })

  it('always renders children in the DOM regardless of reveal state', () => {
    render(<SpoilerBlock level={1}>Secret content here</SpoilerBlock>)
    // Content must be in the DOM for SEO — even when hidden
    expect(screen.getByText('Secret content here')).toBeInTheDocument()
  })

  it('shows reveal button when level > 0 and user has not revealed', () => {
    render(<SpoilerBlock level={1}>Hidden</SpoilerBlock>)
    expect(screen.getByRole('button', { name: /reveal spoiler/i })).toBeInTheDocument()
  })

  it('does not show reveal button when level is 0', () => {
    render(<SpoilerBlock level={0}>Visible</SpoilerBlock>)
    expect(screen.queryByRole('button', { name: /reveal spoiler/i })).not.toBeInTheDocument()
  })

  it('shows custom label in the overlay', () => {
    render(
      <SpoilerBlock level={1} label="Boss Weakness">
        Fire
      </SpoilerBlock>
    )
    expect(screen.getByText('Spoiler: Boss Weakness')).toBeInTheDocument()
  })

  it('hides the overlay after clicking reveal', () => {
    render(<SpoilerBlock level={1}>Secret</SpoilerBlock>)
    fireEvent.click(screen.getByRole('button', { name: /reveal spoiler/i }))
    expect(screen.queryByRole('button', { name: /reveal spoiler/i })).not.toBeInTheDocument()
  })

  it('persists the revealed level to localStorage', () => {
    render(<SpoilerBlock level={2}>Secret</SpoilerBlock>)
    fireEvent.click(screen.getByRole('button', { name: /reveal spoiler/i }))
    expect(storageMock.getItem('vc_spoiler_level')).toBe('2')
  })

  it('auto-reveals when stored threshold meets or exceeds level', async () => {
    storageMock.setItem('vc_spoiler_level', '3')

    await act(async () => {
      render(<SpoilerBlock level={2}>Auto-revealed</SpoilerBlock>)
    })

    // After effect fires, threshold=3 ≥ level=2 → no reveal button
    expect(screen.queryByRole('button', { name: /reveal spoiler/i })).not.toBeInTheDocument()
  })

  it('still hides when stored threshold is below level', async () => {
    storageMock.setItem('vc_spoiler_level', '1')

    await act(async () => {
      render(<SpoilerBlock level={2}>Still hidden</SpoilerBlock>)
    })

    expect(screen.getByRole('button', { name: /reveal spoiler/i })).toBeInTheDocument()
  })
})
