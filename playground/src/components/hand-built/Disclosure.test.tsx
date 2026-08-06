import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { Disclosure } from './Disclosure'

describe('Disclosure', () => {
  it('renders closed with its controlled content hidden', () => {
    render(
      <Disclosure title="Review details">
        <p>Accessible disclosure content</p>
      </Disclosure>,
    )

    const trigger = screen.getByRole('button', { name: 'Review details' })
    const content = screen.getByText('Accessible disclosure content')
    const contentRegion = content.parentElement

    if (!(contentRegion instanceof HTMLElement)) {
      throw new Error('Expected disclosure content to have an HTMLElement region.')
    }

    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(trigger).toHaveAttribute('aria-controls', contentRegion.id)
    expect(contentRegion).not.toBeVisible()
  })

  it('opens with Enter', async () => {
    const user = userEvent.setup()
    render(
      <Disclosure title="Review details">
        <p>Accessible disclosure content</p>
      </Disclosure>,
    )

    const trigger = screen.getByRole('button', { name: 'Review details' })
    trigger.focus()
    await user.keyboard('{Enter}')

    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByText('Accessible disclosure content').parentElement).toBeVisible()
  })

  it('closes with Space', async () => {
    const user = userEvent.setup()
    render(
      <Disclosure title="Review details" defaultOpen>
        <p>Accessible disclosure content</p>
      </Disclosure>,
    )

    const trigger = screen.getByRole('button', { name: 'Review details' })
    trigger.focus()
    await user.keyboard(' ')

    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(screen.getByText('Accessible disclosure content').parentElement).not.toBeVisible()
  })

  it('honors the defaultOpen option', () => {
    render(
      <Disclosure title="Review details" defaultOpen>
        <p>Accessible disclosure content</p>
      </Disclosure>,
    )

    expect(screen.getByRole('button', { name: 'Review details' })).toHaveAttribute(
      'aria-expanded',
      'true',
    )
    expect(screen.getByText('Accessible disclosure content').parentElement).toBeVisible()
  })

  it('skips focusable descendants while collapsed', async () => {
    const user = userEvent.setup()
    render(
      <>
        <Disclosure title="Review details">
          <a href="https://example.com/details">Hidden review link</a>
        </Disclosure>
        <button type="button">Next visible control</button>
      </>,
    )

    await user.tab()
    expect(screen.getByRole('button', { name: 'Review details' })).toHaveFocus()

    await user.tab()
    expect(screen.getByRole('button', { name: 'Next visible control' })).toHaveFocus()
    expect(screen.getByText('Hidden review link')).not.toHaveFocus()
  })
})
