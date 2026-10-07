# test ของ T-03: จองคิวสำเร็จ
# AC-BKG-01 (FR-BKG-04)
from tests.conftest import AUTH
from app.db.models import Booking, Slot


def test_AC_BKG_01(client, make_slot):
    """AC-BKG-01: ยืนยันตัวตนแล้ว และช่วง 09.00 น. มีที่นั่งว่าง จองแล้วต้องสำเร็จ"""
    slot = make_slot(start="09:00", remaining=1)

    res = client.post("/bookings", json={"slot_id": slot.id}, headers=AUTH)

    assert res.status_code == 201


def test_TC_BKG_01_1_booking_success(client, db, make_slot):
    # Given ยืนยันตัวตนแล้ว และช่วง 09.00 น. มีที่นั่งว่าง 1 ที่
    slot = make_slot(start="09:00", remaining=1)

    # When ยืนยันการจอง
    res = client.post("/bookings", json={"slot_id": slot.id}, headers=AUTH)

    # Then บันทึกสำเร็จ แสดงหมายเลขคิว และที่นั่งว่างของช่วงนั้นเป็น 0
    assert res.status_code == 201
    data = res.json()
    assert data["queue_no"] == "A001"
    assert db.get(Slot, slot.id).remaining == 0
    assert db.query(Booking).filter_by(slot_id=slot.id).count() == 1


def test_TC_BKG_01_2_last_seat_booking(client, db, make_slot):
    # Given ยืนยันตัวตนแล้ว และช่วง 09.00 น. มีที่นั่งว่าง 1 ที่ (จุดคงเหลือขั้นต่ำก่อนตัดที่นั่ง)
    slot = make_slot(start="09:00", remaining=1)

    # When ยืนยันการจอง
    res = client.post("/bookings", json={"slot_id": slot.id}, headers=AUTH)

    # Then บันทึกสำเร็จ จำนวนที่นั่งคงเหลือถูกลดจาก 1 เหลือ 0 และหมายเลขคิวที่แสดงเป็นเลขคิวที่ยังไม่ถูกใช้งาน
    assert res.status_code == 201
    assert res.json()["queue_no"] == "A001"
    assert db.get(Slot, slot.id).remaining == 0
    assert db.query(Booking).count() == 1


def test_TC_BKG_01_3_unverified_user_rejected(client, db, make_slot):
    # Given ผู้รับบริการยังไม่ได้ยืนยันตัวตน หรือไม่ได้รับผลยืนยันจากระบบยืนยันตัวตน
    slot = make_slot(start="09:00", remaining=1)

    # When พยายามยืนยันการจองช่วง 09.00 น.
    res = client.post("/bookings", json={"slot_id": slot.id})

    # Then ระบบปฏิเสธการบันทึก ไม่แสดงหมายเลขคิว และไม่สร้างรายการจอง
    assert res.status_code == 401
    assert "queue_no" not in res.json()
    assert db.get(Slot, slot.id).remaining == 1
    assert db.query(Booking).count() == 0
