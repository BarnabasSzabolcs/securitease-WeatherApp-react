import { LocationSelector } from './components/LocationSelector'
import { MainDisplay } from './components/MainDisplay'
import { Timeline } from './components/Timeline'
import './App.css'

function App () {
  return (
    <div className="m-2">
      <div className="max-w-lg mx-auto mt-8 bg-dark border-3 rounded-1xl text-text p-3">
        <LocationSelector/>
      </div>
      <div className="max-w-lg mx-auto mt-2 bg-dark border-3 rounded-1xl text-text p-3">
        <MainDisplay/>
        <Timeline/>
      </div>
    </div>
  )
}

export default App