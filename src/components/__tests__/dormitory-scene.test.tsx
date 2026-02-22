import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'

// ============================================
// Module mocks (must be before component import)
// ============================================

// next/image is not available outside the Next.js runtime
vi.mock('next/image', () => ({
  default: ({ src, alt }: { src: string; alt: string }) =>
    React.createElement('img', { src, alt }),
}))

// useHydrated uses requestAnimationFrame which behaves differently in jsdom;
// return true so the component renders fully without waiting for RAF.
vi.mock('@/hooks/use-hydrated', () => ({
  useHydrated: () => true,
}))

// JournalWriting / JournalViewer pull in additional Next.js internals;
// stub them so they don't affect our tests.
vi.mock('@/components/journal-writing', () => ({
  JournalWriting: () => null,
  JournalViewer: () => null,
}))

import { DormitoryScene } from '../dormitory-scene'
import { createInventoryItem } from '@/lib/inventory'
import type { InventoryState } from '@/lib/inventory'
import type { GameTime } from '@/lib/game-time'

// ============================================
// Test fixtures
// ============================================

const emptyInventory: InventoryState = {
  gold: 100,
  items: [],
  currentTerm: 1,
  termProgress: 0,
}

// Night-time game clock so the "Sleep Until Dawn" button is enabled
const nightTime: GameTime = { day: 'Sunday', hour: 22, minute: 0, dayNumber: 0 }

function fullInventory(): InventoryState {
  return {
    gold: 200,
    currentTerm: 1,
    termProgress: 0,
    items: [
      createInventoryItem('basic-wand', 'Basic Wand', 'A wand', '🪄', 'wands', 1),
      createInventoryItem('school-robes', 'School Robes', 'Robes', '👘', 'robes', 1),
      createInventoryItem('pewter-cauldron', 'Cauldron', 'A cauldron', '🫙', 'cauldrons', 1),
      createInventoryItem('spellbook', 'Spellbook', 'A book', '📚', 'books', 1),
    ],
  }
}

// ============================================
// Helper: render and simulate sleeping
//
// handleSleep runs a real 1000 ms setTimeout before switching phase.
// We use screen.findBy* (which retries with real timers) instead of fake
// timers so that both userEvent and setTimeout work without conflict.
// ============================================

const SLEEP_TIMEOUT = 1500 // slightly above the 1000ms used in handleSleep

async function renderAndSleep(props: {
  inventory?: InventoryState
  hasVisitedShop?: boolean
  hasRequiredMaterials?: boolean
  onHeadToClass?: () => void
}) {
  const user = userEvent.setup()

  render(
    <DormitoryScene
      playerName="Elara"
      inventory={props.inventory ?? emptyInventory}
      journalEntries={[]}
      onSaveJournalEntry={() => {}}
      gameTime={nightTime}
      hasVisitedShop={props.hasVisitedShop ?? false}
      hasRequiredMaterials={props.hasRequiredMaterials ?? false}
      onHeadToClass={props.onHeadToClass}
    />
  )

  // Open the bed panel
  await user.click(screen.getByText('Your Bed'))

  // Trigger the sleep animation (enabled because gameTime is night)
  await user.click(screen.getByText('🌙 Sleep Until Dawn'))

  // handleSleep fires a 1000ms real setTimeout → findByText polls until it appears
  return { user }
}

// ============================================
// Tests
// ============================================

describe('DormitoryScene — "Head to Class" button', () => {
  it(
    'is disabled and labelled "Need Supplies First" when the shop has not been visited',
    async () => {
      await renderAndSleep({ hasVisitedShop: false, hasRequiredMaterials: false })

      const button = await screen.findByRole(
        'button',
        { name: /Need Supplies First/i },
        { timeout: SLEEP_TIMEOUT }
      )
      expect(button).toBeDisabled()
    },
    10_000
  )

  it(
    'is disabled and labelled "Need Supplies First" when shop visited but materials are incomplete',
    async () => {
      await renderAndSleep({ hasVisitedShop: true, hasRequiredMaterials: false })

      const button = await screen.findByRole(
        'button',
        { name: /Need Supplies First/i },
        { timeout: SLEEP_TIMEOUT }
      )
      expect(button).toBeDisabled()
    },
    10_000
  )

  it(
    'is enabled and labelled "Head to Class" when all required materials are present',
    async () => {
      await renderAndSleep({
        inventory: fullInventory(),
        hasVisitedShop: true,
        hasRequiredMaterials: true,
      })

      const button = await screen.findByRole(
        'button',
        { name: /Head to Class/i },
        { timeout: SLEEP_TIMEOUT }
      )
      expect(button).not.toBeDisabled()
    },
    10_000
  )

  it(
    'calls onHeadToClass when the enabled button is clicked',
    async () => {
      const onHeadToClass = vi.fn()
      const { user } = await renderAndSleep({
        inventory: fullInventory(),
        hasVisitedShop: true,
        hasRequiredMaterials: true,
        onHeadToClass,
      })

      const button = await screen.findByRole(
        'button',
        { name: /Head to Class/i },
        { timeout: SLEEP_TIMEOUT }
      )
      await user.click(button)
      expect(onHeadToClass).toHaveBeenCalledOnce()
    },
    10_000
  )

  it(
    'does NOT call onHeadToClass when the button is disabled',
    async () => {
      const onHeadToClass = vi.fn()
      await renderAndSleep({
        hasVisitedShop: false,
        hasRequiredMaterials: false,
        onHeadToClass,
      })

      const button = await screen.findByRole(
        'button',
        { name: /Need Supplies First/i },
        { timeout: SLEEP_TIMEOUT }
      )
      expect(button).toBeDisabled()
      expect(onHeadToClass).not.toHaveBeenCalled()
    },
    10_000
  )

  it(
    'shows a supplies warning with shop link text when shop has not been visited',
    async () => {
      await renderAndSleep({ hasVisitedShop: false, hasRequiredMaterials: false })

      await screen.findByText(/You need supplies before attending class/i, {}, { timeout: SLEEP_TIMEOUT })
      expect(
        screen.getByText(/Visit the School Shop to purchase required items/i)
      ).toBeInTheDocument()
    },
    10_000
  )

  it(
    'shows a different warning when shop visited but materials are incomplete',
    async () => {
      await renderAndSleep({ hasVisitedShop: true, hasRequiredMaterials: false })

      await screen.findByText(/You need supplies before attending class/i, {}, { timeout: SLEEP_TIMEOUT })
      expect(
        screen.getByText(/Make sure you have a wand, robes, cauldron, and grimoire/i)
      ).toBeInTheDocument()
    },
    10_000
  )

  it(
    'shows NO supplies warning when all materials are present',
    async () => {
      await renderAndSleep({
        inventory: fullInventory(),
        hasVisitedShop: true,
        hasRequiredMaterials: true,
      })

      // Wait for the sleep phase to render
      await screen.findByRole('button', { name: /Head to Class/i }, { timeout: SLEEP_TIMEOUT })

      expect(
        screen.queryByText(/You need supplies before attending class/i)
      ).not.toBeInTheDocument()
    },
    10_000
  )
})
