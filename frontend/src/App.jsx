import SlotPicker from './pages/SlotPicker.jsx'
import { createMockApi } from './api/client.js'

export default function App() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-3xl rounded-2xl bg-white p-6 shadow-sm sm:p-10">
        <SlotPicker client={createMockApi()} />
      </div>
    </main>
  )
}
