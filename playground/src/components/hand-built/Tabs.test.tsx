import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { Tabs, type TabItem } from './Tabs'

const testItems: TabItem[] = [
  {
    id: 'overview',
    label: 'Overview',
    content: <button type="button">Overview action</button>,
  },
  {
    id: 'focus',
    label: 'Focus',
    content: <button type="button">Focus action</button>,
  },
  {
    id: 'keyboard',
    label: 'Keyboard',
    content: <button type="button">Keyboard action</button>,
  },
]

function renderTabs(defaultActiveId?: string) {
  return render(
    <Tabs
      label="Accessibility topics"
      items={testItems}
      defaultActiveId={defaultActiveId}
    />,
  )
}

describe('Tabs', () => {
  it('exposes roles, relationships, selection, and roving tabindex', () => {
    renderTabs()

    const tabs = screen.getAllByRole('tab')
    const panels = screen.getAllByRole('tabpanel', { hidden: true })

    expect(tabs).toHaveLength(3)
    expect(panels).toHaveLength(3)
    expect(tabs[0]).toHaveAttribute('aria-selected', 'true')
    expect(tabs[0]).toHaveAttribute('tabindex', '0')
    expect(tabs[1]).toHaveAttribute('tabindex', '-1')
    expect(tabs[2]).toHaveAttribute('tabindex', '-1')
    expect(tabs[0]).toHaveAttribute('aria-controls', panels[0].id)
    expect(panels[0]).toHaveAttribute('aria-labelledby', tabs[0].id)
    expect(panels[0]).toBeVisible()
    expect(panels[1]).not.toBeVisible()
    expect(panels[2]).not.toBeVisible()
  })

  it('moves right and automatically activates the next tab', async () => {
    const user = userEvent.setup()
    renderTabs()
    const overviewTab = screen.getByRole('tab', { name: /Overview/ })

    overviewTab.focus()
    await user.keyboard('{ArrowRight}')

    const focusTab = screen.getByRole('tab', { name: /Focus/ })
    expect(focusTab).toHaveFocus()
    expect(focusTab).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('button', { name: 'Focus action' })).toBeVisible()
  })

  it('wraps left from the first tab to the last', async () => {
    const user = userEvent.setup()
    renderTabs()
    screen.getByRole('tab', { name: /Overview/ }).focus()

    await user.keyboard('{ArrowLeft}')

    const keyboardTab = screen.getByRole('tab', { name: /Keyboard/ })
    expect(keyboardTab).toHaveFocus()
    expect(keyboardTab).toHaveAttribute('aria-selected', 'true')
  })

  it('wraps right from the last tab to the first', async () => {
    const user = userEvent.setup()
    renderTabs('keyboard')
    screen.getByRole('tab', { name: /Keyboard/ }).focus()

    await user.keyboard('{ArrowRight}')

    const overviewTab = screen.getByRole('tab', { name: /Overview/ })
    expect(overviewTab).toHaveFocus()
    expect(overviewTab).toHaveAttribute('aria-selected', 'true')
  })

  it('activates the first tab with Home', async () => {
    const user = userEvent.setup()
    renderTabs('keyboard')
    screen.getByRole('tab', { name: /Keyboard/ }).focus()

    await user.keyboard('{Home}')

    const overviewTab = screen.getByRole('tab', { name: /Overview/ })
    expect(overviewTab).toHaveFocus()
    expect(overviewTab).toHaveAttribute('aria-selected', 'true')
  })

  it('activates the last tab with End', async () => {
    const user = userEvent.setup()
    renderTabs()
    screen.getByRole('tab', { name: /Overview/ }).focus()

    await user.keyboard('{End}')

    const keyboardTab = screen.getByRole('tab', { name: /Keyboard/ })
    expect(keyboardTab).toHaveFocus()
    expect(keyboardTab).toHaveAttribute('aria-selected', 'true')
  })

  it('tabs from the selected tab into active panel content', async () => {
    const user = userEvent.setup()
    renderTabs('focus')
    const focusTab = screen.getByRole('tab', { name: /Focus/ })

    focusTab.focus()
    await user.tab()

    expect(screen.getByRole('button', { name: 'Focus action' })).toHaveFocus()
  })

  it('falls back to the first item for an invalid defaultActiveId', () => {
    renderTabs('missing')

    expect(screen.getByRole('tab', { name: /Overview/ })).toHaveAttribute(
      'aria-selected',
      'true',
    )
  })

  it('renders a safe empty state', () => {
    render(<Tabs label="Empty accessibility topics" items={[]} />)

    expect(screen.getByText('No tab content is available.')).toBeVisible()
    expect(screen.queryByRole('tab')).not.toBeInTheDocument()
  })
})
