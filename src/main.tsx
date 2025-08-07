/**
 * Entry point for the React application.
 * Renders the App component inside React.StrictMode.
 *
 * NOTE: React.StrictMode intentionally double-invokes certain lifecycle methods in development,
 * which results in multiple API calls and causes rate limit error with the free WeatherStack API.
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
