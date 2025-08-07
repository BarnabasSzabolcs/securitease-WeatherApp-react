/**
 * LocationSelector component for searching and selecting a location.
 * Provides an input field and a submit button for user queries.
 * @module
 */

import React, { useState } from 'react'

interface LocationSelectorProps {
  onSubmit: (query: string) => void;
}

export const LocationSelector: React.FC<LocationSelectorProps> = ({ onSubmit }) => {
  const [input, setInput] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return
    onSubmit(input.trim())
    setInput('')
  }

  return (
    <form onSubmit={handleSubmit} className="my-2 flex gap-2" data-e2e="location-selector">
      <input
        type="text"
        className="text-input-text bg-input-bg border rounded px-2 py-1 flex-1 focus:outline focus:outline-2 focus:outline-secondary"
        placeholder="Enter location name"
        value={input}
        onChange={e => setInput(e.target.value.trim())}
        onKeyUp={e => {
          if (e.key === 'Enter') {
            e.preventDefault()
            handleSubmit(e)
          }
        }}
        data-e2e="location-input"
      />
      <button
        type="submit"
        className="bg-secondary text-text px-3 py-1 rounded shadow transition-all duration-200 hover:bg-hover hover:shadow-lg active:scale-95"
        onClick={handleSubmit}
        data-e2e="location-submit"
      >
        Search
      </button>
    </form>
  )
}