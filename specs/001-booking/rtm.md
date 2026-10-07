# RTM: จองคิวตรวจสุขภาพ (Booking)
อ้างอิง: spec.md Draft v2 | tasks.md | test-cases.md
สร้างด้วย /verify เมื่อ 2569-10-07 08:32 | test: 8 ผ่าน 0 ไม่ผ่าน

## 1. ตามรอยไปข้างหน้า (requirement ไป โค้ด ไป test)
| ID | AC | task | โค้ด (ไฟล์: ฟังก์ชัน) | test (ผล) | สถานะ |
|---|---|---|---|---|---|
| FR-BKG-01 | AC-BKG-05 | T-02 | backend/app/slots/router.py:get_slots; backend/app/slots/service.py:list_available_slots | backend/tests/test_AC_BKG_05.py: ผ่าน | ครบ |
| FR-BKG-02 | AC-BKG-02 | T-04 | ไม่มีการปฏิเสธคิวซ้ำในวันเดียวกันใน backend/app/booking/service.py | ไม่มี | ยังไม่ถึง |
| FR-BKG-03 | AC-BKG-03 | T-05, T-11, T-12 | ไม่มีการแจ้ง "ช่วงเวลาเต็ม" และไม่มีข้อเสนอ 3 ช่วงใน frontend/src/ และ backend/app/slots/service.py | ไม่มี | ยังไม่ถึง |
| FR-BKG-04 | AC-BKG-01 | T-03, T-06 | backend/app/booking/router.py:create_booking; backend/app/booking/service.py:create_booking; backend/app/booking/service.py:next_queue_no | backend/tests/test_AC_BKG_01.py: 4 tests ผ่าน | ครบ |
| FR-BKG-05 | AC-BKG-04 | T-07 | ไม่มีคิวส่งซ้ำ/การบันทึก fallback เมื่อส่ง SMS ไม่สำเร็จ | ไม่มี | ยังไม่ถึง |
| FR-BKG-06 | ไม่มี AC | T-10, T-12 | backend/app/slots/router.py:get_slots รับ package_code และ backend/app/slots/service.py:list_available_slots กรอง package_code | ไม่มี | ยังไม่ถึง |
| CON-TECH-01 | ไม่มี AC | T-01 | backend/app/config.py:DATABASE_URL; backend/app/db/session.py:get_db | backend/tests/test_T01_schema.py: ผ่าน | ครบ |
| DOM-PDPA-01 | AC-BKG-06 | T-08 | backend/app/db/models.py:AuditLog มีคอลัมน์ actor_id/action/hn แต่ไม่มี middleware บันทึกจาก request | ไม่มี | ยังไม่ถึง |
| IF-IDP-01 | AC-BKG-01 (เฉพาะส่วนไม่ยืนยันตัวตน) | T-03 | backend/app/auth/idp.py:get_verified_hn | backend/tests/test_AC_BKG_01.py::test_TC_BKG_01_3_unverified_user_rejected: ผ่าน | ครบ |
| IF-HIS-01 | ไม่มี AC | T-09 | backend/app/db/models.py:Booking เก็บ hn เท่านั้น; ไม่มี client ค้น HIS และไม่มีพารามิเตอร์ national_id ในการบันทึก | ไม่มี | ยังไม่ถึง |
| IF-NOT-01 | AC-BKG-04 | T-07 | ไม่มี backend/app/notify/queue.py หรือการวางงาน async | ไม่มี | ยังไม่ถึง |
| NFR-PERF-01 | AC-BKG-05 | T-02 | backend/app/slots/service.py:list_available_slots | backend/tests/test_AC_BKG_05.py: ผ่าน | ครบ |
| NFR-SEC-01 | ไม่มี AC | ไม่มี | ไม่มี TLS enforcement หรือ config security ในโค้ด | ไม่มี | ยังไม่ถึง |
| NFR-REL-02 | AC-BKG-04 | T-07 | ไม่มี retry queue และไม่มีดึงค่าจาก spec อย่างชัดเจน | ไม่มี | ยังไม่ถึง |
| NFR-USE-01 | ไม่มี AC | ไม่มี | ไม่มีโค้ดหรือ test ที่วัดเวลาเอาชนะ 3 นาทีและ 8/10 คน | ไม่มี | ยังไม่ถึง |

## 2. ตามรอยย้อนกลับ (โค้ด ไป requirement)
| โค้ด (ไฟล์: ฟังก์ชัน หรือ endpoint) | อ้าง ID | ตรงกับข้อความใน spec ไหม | หมายเหตุ |
|---|---|---|---|
| backend/app/slots/service.py:list_available_slots | FR-BKG-01, FR-BKG-06 | ไม่ครบ | กำหนด `DAYS_AHEAD = 14` ซึ่งตรงกับ 14 วัน ไม่ใช่ 30 วันตาม spec |
| backend/app/booking/service.py:next_queue_no | FR-BKG-04, Q-02 | ไม่ครบ | ใช้รูปแบบ `A001` และรีเซ็ตแต่ละวัน โดยตรงจากการเดาเรื่อง Q-02 ที่ spec ระบุว่า "ยังไม่ได้คำตอบ" |
| backend/app/booking/router.py:create_booking | FR-BKG-04, IF-IDP-01 | ครบบางส่วน | ตรวจยืนยันตัวตนแล้วบันทึก แต่ไม่มี FR-BKG-02 (กันจองซ้ำ) และไม่มี async notify สำหรับ IF-NOT-01 |
| backend/app/db/models.py:Booking | IF-HIS-01 | ครบบางส่วน | เก็บเฉพาะ `hn` และไม่มี `national_id` อย่างชัดเจน แต่ไม่มีฟังก์ชันค้น HIS ต่อไปยัง HN อย่างจริงจัง |
| backend/app/config.py:DATABASE_URL | CON-TECH-01 | ครบ | ใช้ PostgreSQL ในระบบจริงและ SQLite เป็นค่า default สำหรับ local test ซึ่งสอดคล้องกับ plan.md |

## 3. ข้อค้นพบ
ชนิด: AC ไม่มี test / test อ่อน / โค้ดไม่มี FR / FR ไม่มี AC / เดา Q-xx / ละเมิด Constraint / ตัวเลขไม่ตรง spec / อ้าง ID ผิดเรื่อง
ทีมตัดสิน: แก้โค้ด / แก้ spec / เพิ่ม Q-xx / ไม่ใช่ปัญหา (พร้อมเหตุผล 1 บรรทัด)

| F-ID | ชนิด | อยู่ที่ | ขัดกับ | รายละเอียด | ทีมตัดสิน |
|---|---|---|---|---|---|
| F-01 | ตัวเลขไม่ตรง spec | backend/app/slots/service.py | FR-BKG-01 | โค้ดใช้ `DAYS_AHEAD = 14` แสดงช่วงเวลาแบบ 14 วันเท่านั้น ขณะที่ spec ระบุภายใน 30 วันข้างหน้า |  |
| F-02 | เดา Q-xx | backend/app/booking/service.py:next_queue_no | Q-02, FR-BKG-04 | spec ระบุ Q-02 ยังไม่ได้คำตอบ แต่โค้ดกำหนดรูปแบบ `A001` และเรียกซ้ำทุกวัน แสดงว่ามีการตัดสินใจแทนทีมโดยไม่รอคำตอบจากเจ้าหน้าที่เวชระเบียน |  |

## 4. แก้แล้ว
| F-ID | แก้อย่างไร | รู้ได้อย่างไร |
|---|---|---|
