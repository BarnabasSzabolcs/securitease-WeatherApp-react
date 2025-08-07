import { expect, test } from '@playwright/test'

test('Weather app initial state and timeline interaction', async ({ page }) => {
  await page.goto('/')
  const isMockEnabled = process.env.VITE_USE_MOCK_API === 'true'
  const arePaidEndpointsEnabled = process.env.VITE_USE_PAID_ENDPOINTS === 'true'

  // Check initial location in main display
  const locationText = await page.locator('[data-e2e="main-location"]').innerText()
  const expectedInitialLocation = {
    falsefalse: 'Pretoria, Gauteng, South Africa',
    falsetrue: 'Pretoria, Gauteng, South Africa',
    truefalse: 'Pretoria, Mock Current, Mockland',
    truetrue: 'Pretoria, Mock History, Mockland',
  }[`${isMockEnabled}${arePaidEndpointsEnabled}`]

  expect(locationText).toBe('Loading...')
  await expect(page.locator('[data-e2e="main-location"]')).toHaveText(expectedInitialLocation)

  // Check timeline items
  const timelineToday = page.locator('[data-e2e="timeline-today"]')
  const timelineItems = page.locator('[data-e2e="timeline-item"], [data-e2e="timeline-today"]')
  const timelineCount = await timelineItems.count()
  expect(timelineCount).toBe(7)

  // Check that entering 'Las Palmas' updates the location
  await page.locator('[data-e2e="location-input"]').fill('Las Palmas')
  await page.locator('[data-e2e="location-submit"]').click()
  const expectedNewLocation = {
    falsefalse: 'Las Palmas, Canary Islands, Spain',
    falsetrue: 'Las Palmas, Canary Islands, Spain',
    truefalse: 'Las Palmas, Mock Current, Mockland',
    truetrue: 'Las Palmas, Mock History, Mockland',
  }[`${isMockEnabled}${arePaidEndpointsEnabled}`]
  await expect(page.locator('[data-e2e="main-location"]')).toHaveText(expectedNewLocation)

  // If history is false, all non-today timeline items should show '-'
  if (!arePaidEndpointsEnabled) {
    for (let i = 0; i < timelineCount; i++) {
      const tempText = await timelineItems.nth(i).locator('[data-e2e="temperature"]').innerText()
      if (i == 3)
        expect(tempText).toBe('28°c')
      else
        expect(tempText).toBe('-')
    }
  } else {
    // If history is true, check that timeline items have valid temperatures
    for (let i = 0; i < timelineCount; i++) {
      const tempText = await timelineItems.nth(i).locator('[data-e2e="temperature"]').innerText()
      expect(tempText).toBe(`${28 - 3 + i}°c`)
    }
  }

  // Click a timeline item (not today), check highlight and main display update
  await timelineItems.nth(1).click()
  const selectedClass = /bg-selected/
  await expect(timelineItems.nth(1)).toHaveClass(selectedClass)
  await expect(timelineToday).not.toHaveClass(selectedClass)
  const temp = await timelineItems.nth(1).locator('[data-e2e="temperature"]').innerText()
  await expect(page.locator('[data-e2e="main-display"]')).toContainText(temp)

  const clickToday = async () => {
    await timelineToday.click()
    await expect(timelineToday).toHaveClass(selectedClass)
    const todayTemp = await timelineToday.locator('[data-e2e="temperature"]').innerText()
    await expect(page.locator('[data-e2e="main-display"]')).toContainText(todayTemp)
  }

  // Click back to today, check highlight and main display
  await clickToday()

  if (!arePaidEndpointsEnabled) {
    // Click to a future date (that has no data), check main display shows '-'
    await timelineItems.nth(5).click()
    await expect(timelineItems.nth(5)).toHaveClass(selectedClass)
    const futureTemp = await timelineItems.nth(5).locator('[data-e2e="temperature"]').innerText()
    expect(futureTemp).toBe('-')
    await expect(page.locator('[data-e2e="main-display"]')).toContainText('-')
  }
  // Click back to today, check highlight and main display
  await clickToday()
})