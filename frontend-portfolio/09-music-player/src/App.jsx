import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './index.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="max-w-[1280px] mx-auto p-8 text-center">
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="h-24 p-6 transition-[filter] duration-300 hover:drop-shadow-[0_0_2em_#646cffaa]" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="h-24 p-6 transition-[filter] duration-300 hover:drop-shadow-[0_0_2em_#61dafbaa] motion-safe:animate-spin" alt="React logo" style={{ animationDuration: '20s' }} />
        </a>
      </div>
      <h1 className="text-4xl font-bold my-4">Vite + React</h1>
      <div className="p-8">
        <button onClick={() => setCount((count) => count + 1)} className="py-2 px-4 rounded-lg border border-transparent bg-gray-100 cursor-pointer text-base font-medium transition-colors hover:border-indigo-500">
          count is {count}
        </button>
        <p className="mt-4">
          Edit <code className="bg-gray-100 px-1 rounded">src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="text-gray-500">
        Click on the Vite and React logos to learn more
      </p>
    </div>
  )
}

export default App
