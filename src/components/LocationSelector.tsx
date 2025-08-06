import React, { useState } from 'react'

export const LocationSelector = () => {
    const [input, setInput] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return
    // TODO: get new weather data based on input
  }

  return (
    <form onSubmit={handleSubmit} className="my-2 flex gap-2">
      <input
        type="text"
        className="text-input-text bg-input-bg border rounded px-2 py-1 flex-1 focus:outline focus:outline-2 focus:outline-secondary"
        placeholder="Enter location name"
        value={input}
        onChange={e => {setInput(e.target.value); handleSubmit(e)}}

      />
      <button
        type="submit"
        className="bg-secondary text-text px-3 py-1 rounded shadow transition-all duration-200 hover:bg-hover hover:shadow-lg active:scale-95"

      >
        Search
      </button>
    </form>
  )
}