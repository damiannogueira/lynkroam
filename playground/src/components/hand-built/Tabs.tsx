import {
  type KeyboardEvent,
  type ReactNode,
  useId,
  useRef,
  useState,
} from 'react'

export type TabItem = {
  id: string
  label: string
  content: ReactNode
}

export type TabsProps = {
  label: string
  items: TabItem[]
  defaultActiveId?: string
}

function getInitialActiveId(
  items: TabItem[],
  defaultActiveId?: string,
): string | null {
  const matchingItem = items.find((item) => item.id === defaultActiveId)

  return matchingItem?.id ?? items[0]?.id ?? null
}

export function Tabs({ label, items, defaultActiveId }: TabsProps) {
  const tabsId = useId()
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([])
  const [activeId, setActiveId] = useState<string | null>(() =>
    getInitialActiveId(items, defaultActiveId),
  )

  const matchedActiveIndex = items.findIndex((item) => item.id === activeId)
  const activeIndex = matchedActiveIndex >= 0 ? matchedActiveIndex : 0

  const moveFocusAndActivate = (targetIndex: number): void => {
    const targetItem = items[targetIndex]

    if (!targetItem) {
      return
    }

    setActiveId(targetItem.id)
    tabRefs.current[targetIndex]?.focus()
  }

  const handleKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    currentIndex: number,
  ): void => {
    let targetIndex: number

    switch (event.key) {
      case 'ArrowRight':
        targetIndex = (currentIndex + 1) % items.length
        break
      case 'ArrowLeft':
        targetIndex = (currentIndex - 1 + items.length) % items.length
        break
      case 'Home':
        targetIndex = 0
        break
      case 'End':
        targetIndex = items.length - 1
        break
      default:
        return
    }

    event.preventDefault()
    moveFocusAndActivate(targetIndex)
  }

  if (items.length === 0) {
    return (
      <div className="tabs tabs--empty">
        <p>No tab content is available.</p>
      </div>
    )
  }

  return (
    <div className="tabs">
      <div className="tabs__list" role="tablist" aria-label={label}>
        {items.map((item, index) => {
          const isSelected = index === activeIndex
          const tabId = `${tabsId}-tab-${index}`
          const panelId = `${tabsId}-panel-${index}`

          return (
            <button
              key={item.id}
              ref={(element) => {
                tabRefs.current[index] = element
              }}
              type="button"
              className="tabs__trigger"
              id={tabId}
              role="tab"
              aria-selected={isSelected}
              aria-controls={panelId}
              tabIndex={isSelected ? 0 : -1}
              onClick={() => setActiveId(item.id)}
              onKeyDown={(event) => handleKeyDown(event, index)}
            >
              <span>{item.label}</span>
              {isSelected ? (
                <span className="tabs__selected-marker" aria-hidden="true">
                  Selected
                </span>
              ) : null}
            </button>
          )
        })}
      </div>

      {items.map((item, index) => {
        const isSelected = index === activeIndex
        const tabId = `${tabsId}-tab-${index}`
        const panelId = `${tabsId}-panel-${index}`

        return (
          <div
            key={item.id}
            className="tabs__panel"
            id={panelId}
            role="tabpanel"
            aria-labelledby={tabId}
            hidden={!isSelected}
          >
            {item.content}
          </div>
        )
      })}
    </div>
  )
}
