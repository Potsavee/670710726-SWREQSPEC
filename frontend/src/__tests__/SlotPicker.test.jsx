import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import SlotPicker from '../pages/SlotPicker.jsx'

function mockClient() {
  return {
    getSlots: vi.fn(({ packageCode }) => Promise.resolve({
      slots: [
        {
          id: `${packageCode}-1`,
          slot_date: '2026-09-24',
          start_time: '09:00',
          remaining: packageCode === 'PKG-A' ? 2 : 5,
        },
      ],
    })),
  }
}

test('T-13 แสดงช่วงเวลาว่างและโหลดข้อมูลใหม่เมื่อเปลี่ยนแพ็กเกจ', async () => {
  const client = mockClient()
  render(<SlotPicker client={client} />)

  expect(await screen.findByText('เหลือ 2 ที่นั่ง')).toBeTruthy()
  expect(client.getSlots).toHaveBeenCalledWith({
    dateFrom: expect.any(String),
    packageCode: 'PKG-A',
  })

  fireEvent.change(screen.getByLabelText('แพ็กเกจ'), { target: { value: 'PKG-B' } })

  await waitFor(() => expect(screen.getByText('เหลือ 5 ที่นั่ง')).toBeTruthy())
  expect(client.getSlots).toHaveBeenLastCalledWith({
    dateFrom: expect.any(String),
    packageCode: 'PKG-B',
  })
})