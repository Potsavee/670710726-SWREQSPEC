import { useEffect, useState } from 'react'

const packages = [
  { code: 'PKG-A', label: 'แพ็กเกจ A' },
  { code: 'PKG-B', label: 'แพ็กเกจ B' },
]

function todayAsIsoDate() {
  return new Date().toISOString().slice(0, 10)
}

function groupSlotsByDate(slots) {
  return slots.reduce((groups, slot) => {
    const dateSlots = groups[slot.slot_date] ?? []
    dateSlots.push(slot)
    return { ...groups, [slot.slot_date]: dateSlots }
  }, {})
}

// Displays available slots and reloads them when the package changes (FR-BKG-01, FR-BKG-06).
export default function SlotPicker({ client }) {
  const [packageCode, setPackageCode] = useState(packages[0].code)
  const [slots, setSlots] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    setLoading(true)
    setError('')

    client
      .getSlots({ dateFrom: todayAsIsoDate(), packageCode })
      .then((result) => {
        if (active) setSlots(result.slots ?? [])
      })
      .catch(() => {
        if (active) setError('ไม่สามารถโหลดช่วงเวลาว่างได้')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [client, packageCode])

  const slotsByDate = groupSlotsByDate(slots)

  return (
    <section aria-labelledby="slot-picker-title" className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">Booking</p>
        <h1 id="slot-picker-title" className="mt-2 text-3xl font-bold text-slate-900">
          เลือกแพ็กเกจและช่วงเวลาตรวจ
        </h1>
        <p className="mt-2 text-slate-600">ช่วงเวลาที่แสดงอยู่ภายใน 30 วันข้างหน้า</p>
      </div>

      <label className="block max-w-sm text-sm font-semibold text-slate-700" htmlFor="package-code">
        แพ็กเกจ
        <select
          id="package-code"
          className="mt-2 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-base font-normal text-slate-900 shadow-sm"
          value={packageCode}
          onChange={(event) => setPackageCode(event.target.value)}
        >
          {packages.map((item) => (
            <option key={item.code} value={item.code}>
              {item.label}
            </option>
          ))}
        </select>
      </label>

      {loading && <p role="status">กำลังโหลดช่วงเวลาว่าง...</p>}
      {error && <p role="alert" className="text-red-700">{error}</p>}

      {!loading && !error && (
        <div className="space-y-4">
          {Object.entries(slotsByDate).map(([date, dateSlots]) => (
            <div key={date} className="border-t border-slate-200 pt-4">
              <h2 className="text-lg font-semibold text-slate-800">{date}</h2>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {dateSlots.map((slot) => (
                  <button
                    type="button"
                    key={slot.id}
                    className="rounded-lg border border-slate-300 bg-white p-4 text-left shadow-sm hover:border-teal-600"
                    disabled={slot.remaining === 0}
                  >
                    <span className="block font-semibold text-slate-900">{slot.start_time}</span>
                    <span className="mt-1 block text-sm text-slate-600">
                      เหลือ {slot.remaining} ที่นั่ง
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))}
          {slots.length === 0 && <p className="text-slate-600">ยังไม่มีช่วงเวลาว่าง</p>}
        </div>
      )}
    </section>
  )
}
