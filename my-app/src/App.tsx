import { useState } from 'react'
import { Sword } from 'lucide-react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-sky-50 to-sky-100 p-8 text-slate-800">
      <Sword size={72} className="text-indigo-600 mb-6" />
      <h1 className="mb-4 text-4xl font-bold">Swipe Summoner</h1>
      <button
        onClick={() => setCount((c) => c + 1)}
        className="rounded bg-indigo-600 px-6 py-2 text-white hover:bg-indigo-700"
      >
        Summon {count}
      </button>
    </main>
  )
}

export default App
