# แผนเทคนิค: จองคิวตรวจสุขภาพ (Booking)

## 1. สรุปแนวทาง
- ฟีเจอร์นี้ให้ผู้รับบริการที่ยืนยันตัวตนแล้วเลือกแพ็กเกจ วัน และช่วงเวลาตรวจสุขภาพ แล้วได้หมายเลขคิว
- ผู้ใช้หลักคือผู้รับบริการและเจ้าหน้าที่ที่ดูข้อมูลการจองในเวชระเบียน/ระบบบริการ
- ระบบจะคำนวณช่วงเวลาว่างจากข้อมูลคงเหลือ, ป้องกันจองซ้ำในวันเดียวกัน, และจบด้วยบันทึกการจองและคำขอแจ้งเตือน
- การทำงานที่เป็น asynchronous จะถูกแยกออกจาก transaction หลักเพื่อให้การจองไม่ต้องรอผลส่งข้อความ
- แผนนี้อ้างอิงจาก FR-BKG-01 ถึง FR-BKG-06, NFR-PERF-01, NFR-REL-02, DOM-PDPA-01 และ Constraints ที่มีอยู่ใน spec เท่านั้น

## 2. เทคโนโลยีที่ใช้
| สิ่งที่เลือก | มาจาก | หมายเหตุ |
|---|---|---|
| React (Vite) | ทีมเลือกเอง ไม่ได้มาจาก spec | ใช้สำหรับส่วนหน้าจอเลือกแพ็กเกจ วัน ช่วงเวลา และยืนยันการจอง |
| Python FastAPI | ทีมเลือกเอง ไม่ได้มาจาก spec | ใช้สำหรับ API ค้นหาช่วงเวลาว่างและจัดการการจอง |
| MySQL | CON-TECH-01 | ใช้เก็บข้อมูล booking, slot inventory, notification outbox และ audit log |
| SMTP/SMS/LINE notification gateway | IF-NOT-01 | ส่งข้อความยืนยันแบบ asynchronous ผ่าน outbox โดยไม่ให้ booking รอ |
| TLS 1.2+ | NFR-SEC-01 | ใช้ในการปกป้องข้อมูลขณะรับส่ง |

## 3. โมเดลข้อมูล
| Entity | ฟิลด์หลัก | รองรับ FR / Constraint |
|---|---|---|
| Booking | booking_id, person_hn, package_id, booking_date, slot_id, queue_number, status, created_at, created_by | FR-BKG-02, FR-BKG-04, FR-BKG-05, AC-BKG-01, AC-BKG-02, AC-BKG-04 |
| SlotInventory | slot_id, date, time_slot, quota, occupied_count, available_count | FR-BKG-01, FR-BKG-03, FR-BKG-06, AC-BKG-03, AC-BKG-05 |
| BookingValidationState | person_hn, booking_date, has_active_booking, active_queue_number | FR-BKG-02, AC-BKG-02 |
| NotificationOutbox | notification_id, booking_id, channel, status, retry_count, scheduled_at, last_attempt_at | FR-BKG-05, NFR-REL-02, AC-BKG-04 |
| AuditLog | audit_id, actor, accessed_at, person_hn, action | DOM-PDPA-01, AC-BKG-06 |

หมายเหตุ: ตาม IF-HIS-01 ไม่มีฟิลด์เลขบัตรประชาชนในตาราง Booking และใช้ HN เป็นรหัสอ้างอิงภายในระบบเท่านั้น

## 4. API / หน้าจอ
- GET /api/availability?packageId=&dateFrom=&dateTo= -> แสดงช่วงเวลาว่าง 30 วันพร้อมจำนวนที่นั่งคงเหลือ; รองรับ FR-BKG-01
- POST /api/bookings/validate -> ตรวจคิวที่ยังไม่ได้ใช้ในวันเดียวกันและตรวจ slot ว่างก่อนยืนยัน; รองรับ FR-BKG-02, FR-BKG-03
- POST /api/bookings -> บันทึกการจอง, ตัดจำนวนที่นั่ง, สร้างหมายเลขคิว, ส่งคำขอแจ้งเตือน; รองรับ FR-BKG-04
- GET /api/bookings/{bookingId} -> แสดงหมายเลขคิวและสถานะส่งข้อความ; รองรับ FR-BKG-05
- POST /api/notifications/retry -> ส่งซ้ำข้อความที่ยังค้างภายใน 5 นาที; รองรับ NFR-REL-02
- หน้า BookingSelection -> เลือกแพ็กเกจ วัน และช่วงเวลา; รองรับ FR-BKG-01, FR-BKG-06
- หน้า BookingConfirmation -> แสดง “ช่วงเวลาเต็ม” พร้อมตัวเลือก 3 ตัวเลือกจากวันเดียวกันและวันถัดไป; รองรับ FR-BKG-03

## 5. ตารางตรวจ Constraints
| Constraint ID | ถูกนำไปใช้ที่ไหนใน plan | สถานะ |
|---|---|---|
| CON-TECH-01 | MySQL ใช้เก็บข้อมูล Booking, SlotInventory, NotificationOutbox, AuditLog | ใช้แล้ว |
| DOM-PDPA-01 | AuditLog และกลไกบันทึกผู้เข้าถึง เวลา และ person_hn ทุกครั้งที่เปิดดูข้อมูล | ใช้แล้ว |
| IF-IDP-01 | Authentication gate ก่อนเข้าหน้า BookingSelection และ BookingConfirmation | ใช้แล้ว |
| IF-HIS-01 | ดึงข้อมูลผู้รับบริการจาก HIS แล้วเก็บเป็น HN เท่านั้น ไม่เก็บเลขบัตรประชาชนใน Booking | ใช้แล้ว |
| IF-NOT-01 | NotificationOutbox + async delivery flow เพื่อให้ booking ไม่รอผลส่งข้อความ | ใช้แล้ว |

## 6. แผนทดสอบจาก Acceptance Criteria
| AC ID | ชื่อ test | ทดสอบอย่างไร |
|---|---|---|
| AC-BKG-01 | test_AC_BKG_01_booking_success_decreases_inventory | ตั้งค่าสล็อต 09:00 ว่าง 1 ที่ ให้ยืนยันการจอง แล้วตรวจว่าบันทึกสำเร็จ แสดงหมายเลขคิว และ available_count = 0 |
| AC-BKG-02 | test_AC_BKG_02_block_duplicate_same_day_booking | ตั้งค่า active booking ในวันเดียวกัน แล้วลองจองอีกครั้ง ตรวจว่าปฏิเสธและแสดงหมายเลขคิวเดิม |
| AC-BKG-03 | test_AC_BKG_03_show_alternative_slots_when_full | จำลอง slot ว่าง 1 ที่และมีคนยืนยันก่อน ตรวจว่าระบบแจ้ง “ช่วงเวลาเต็ม” และแสดง 3 ทางเลือกจากวันเดียวกันและวันถัดไป |
| AC-BKG-04 | test_AC_BKG_04_retry_queue_when_notification_fails | จำลอง notification gateway ล้มเหลว แล้วตรวจว่าการจองยังบันทึก, แสดงหมายเลขคิว, และมี outbox ที่กำหนดส่งซ้ำภายใน 5 นาที |
| AC-BKG-05 | test_AC_BKG_05_availability_query_p95_under_2s | จำลองผู้ใช้พร้อมกัน 200 คน เรียก availability API แล้ววัด p95 <= 2 วินาที |
| AC-BKG-06 | test_AC_BKG_06_audit_log_written | เปิดดูข้อมูลการจองของผู้รับบริการ แล้วตรวจว่า AuditLog มี actor, time, person_hn |

## 7. ลำดับงาน
1. สร้าง schema สำหรับ Booking, SlotInventory, NotificationOutbox, AuditLog ตาม FR-BKG-01, FR-BKG-04, DOM-PDPA-01
2. สร้าง API availability และ UI หน้าเลือกวัน/เวลา ตาม FR-BKG-01 และ FR-BKG-06
3. สร้าง validation สำหรับคิวที่ยังไม่ได้ใช้ในวันเดียวกันและตัวเลือกใกล้เคียง ตาม FR-BKG-02 และ FR-BKG-03
4. ดำเนิน booking transaction สำหรับบันทึกข้อมูลและตัดจำนวนที่นั่ง ตาม FR-BKG-04 และ AC-BKG-01
5. สร้าง outbox retry สำหรับ notification ภายใน 5 นาที ตาม FR-BKG-05 และ NFR-REL-02
6. เพิ่มการบันทึก audit log และตรวจสอบการใช้งานจาก IF-IDP-01, IF-HIS-01, DOM-PDPA-01
7. ทดสอบประสิทธิภาพและความปลอดภัยตาม AC-BKG-05 และ NFR-SEC-01

## 8. สิ่งที่ยังไม่ทำ
- Q-01: “คิวที่ยังไม่ได้ใช้ในวันเดียวกัน” หมายถึงสถานะใดบ้าง? -> ส่วนที่เกี่ยวข้องกับข้อนี้จะยังไม่สร้างจนกว่าจะได้คำตอบจากเจ้าหน้าที่เวชระเบียน

## 9. รายงานทีม
1. Constraint ที่ยังไม่ได้ใช้: ไม่มี การใช้ในแผนนี้ทั้งหมดครบตาม spec แล้ว ไม่มี Constraint ที่ถูกข้าม
2. AC ที่ทดสอบยากหรือทดสอบไม่ได้ในสภาพแวดล้อมของนักศึกษา: AC-BKG-05 (p95 under 2s ที่ 200 คนพร้อมกัน) ต้องใช้ load test จริงหรือสภาพแวดล้อมจำลองที่ใกล้เคียงมากที่สุด และ AC-BKG-04 ต้องจำลอง notification failure ที่มักต้องมี queue/worker จริง
3. สิ่งที่อยากเดาแต่ไม่ได้เดา: ไม่ได้เดาว่าคำจำกัดความของ “คิวที่ยังไม่ได้ใช้” ครอบคลุมสถานะไหนบ้าง จนกว่าจะได้คำตอบจากเจ้าหน้าที่เวชระเบียน

---

ข้อมูลนี้อ้างอิงจาก [specs/001-booking/spec.md](specs/001-booking/spec.md) และติดตาม Open Question ที่ยังค้างไว้ใน [specs/001-booking/spec.md](specs/001-booking/spec.md) อย่างเคร่งครัด
