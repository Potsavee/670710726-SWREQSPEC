// จุดเดียวที่หน้าจอใช้เรียก API หลังบ้าน (ตามสัญญา API ใน plan.md ข้อ 4)
// ตอน test ให้ส่ง client จำลองเข้าไปในหน้าจอแทน ไม่ต้องรันหลังบ้านจริง
// เรียกผ่าน /api (ดู proxy ใน vite.config.js) หลังบ้านต้องรันอยู่ที่ port 8000
const BASE = import.meta.env.VITE_API_BASE ?? '/api'

export const api = {
  async getSlots({ dateFrom, packageCode }) {
    const q = new URLSearchParams({ date_from: dateFrom, package_code: packageCode })
    const res = await fetch(`${BASE}/slots?${q}`)
    return res.json()
  },
  async createBooking({ slotId }) {
    const res = await fetch(`${BASE}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slot_id: slotId }),
    })
    return { status: res.status, body: await res.json() }
  },
}

// Supplies deterministic slot data while the screen is developed without the backend (FR-BKG-01, FR-BKG-06).
export function createMockApi() {
  return {
    async getSlots({ packageCode }) {
      const baseSlots = [
        { id: `${packageCode}-1`, slot_date: '2026-09-24', start_time: '09:00', remaining: 2 },
        { id: `${packageCode}-2`, slot_date: '2026-09-24', start_time: '13:00', remaining: 0 },
        { id: `${packageCode}-3`, slot_date: '2026-09-25', start_time: '10:00', remaining: 4 },
      ]
      return { slots: baseSlots.map((slot) => ({ ...slot, package_code: packageCode })) }
    },
  }
}
