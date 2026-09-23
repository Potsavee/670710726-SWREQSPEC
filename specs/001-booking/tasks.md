# Tasks: จองคิวตรวจสุขภาพ (Booking)

- Feature: จองคิวตรวจสุขภาพ (Booking)
- Spec ID: SPEC-BKG-001
- อ้างอิง: [plan.md](plan.md)
- วันที่: 2569-09-23
- สรุป: มีทั้งหมด 19 tasks เรียงตามการพึ่งพาของข้อมูล, API, หน้าจอ และการทดสอบ
- มี 1 task ที่ต้องรอ Open Question คือ Q-02 เรื่องรูปแบบและวิธีออกหมายเลขคิว

### T-01 สร้างโมเดลและ migration ฐานข้อมูล
- รองรับ: CON-TECH-01, IF-HIS-01, FR-BKG-01, FR-BKG-02, FR-BKG-04, DOM-PDPA-01
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของ T-03, T-05, T-06 และ T-15
- ไฟล์ที่แตะ: `backend/app/db/models.py`, `backend/app/db/session.py`, `backend/app/db/migrations/001_init.py`, `backend/tests/conftest.py`
- ต้องทำหลัง: ไม่มี
- เสร็จเมื่อ: migration สร้างตาราง `slots`, `bookings` และ `audit_logs` ได้ และตาราง `bookings` ไม่มีคอลัมน์เลขบัตรประชาชน
- สถานะ: เสร็จ

### T-02 สร้างการตรวจผลยืนยันตัวตน
- รองรับ: IF-IDP-01
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของ T-03, T-05 และ T-15
- ไฟล์ที่แตะ: `backend/app/auth/idp.py`, `backend/tests/test_idp.py`
- ต้องทำหลัง: T-01
- เสร็จเมื่อ: endpoint ที่เข้าถึงข้อมูลผู้รับบริการปฏิเสธคำขอที่ไม่มีผลยืนยันตัวตน และยอมรับคำขอที่ยืนยันแล้ว
- สถานะ: พร้อมทำ

### T-03 สร้างบริการค้นหาช่วงเวลาว่าง
- รองรับ: FR-BKG-01, FR-BKG-06, ASM-01, ASM-02
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของ T-04 และ T-13
- ไฟล์ที่แตะ: `backend/app/slots/service.py`, `backend/tests/test_slots_service.py`
- ต้องทำหลัง: T-01, T-02
- เสร็จเมื่อ: service คืนช่วงเวลาภายใน 30 วันพร้อม `remaining` และคำนวณผลใหม่เมื่อ `package_code` เปลี่ยน โดยใช้เขตเวลา Asia/Bangkok
- สถานะ: พร้อมทำ

### T-04 เปิด API ค้นหาช่วงเวลาว่างและทดสอบประสิทธิภาพ
- รองรับ: FR-BKG-01, NFR-PERF-01, IF-IDP-01
- ตรวจด้วย: AC-BKG-05
- ไฟล์ที่แตะ: `backend/app/slots/router.py`, `backend/app/main.py`, `backend/tests/test_AC_BKG_05.py`
- ต้องทำหลัง: T-03
- เสร็จเมื่อ: `GET /slots` คืนช่วงเวลาและที่นั่งคงเหลือ และการทดสอบ concurrent 200 requests วัด p95 ไม่เกิน 2 วินาทีในสภาพแวดล้อมทดสอบที่กำหนด
- สถานะ: พร้อมทำ

### T-05 สร้างบริการและ API บันทึกการจองพื้นฐาน
- รองรับ: FR-BKG-04, IF-IDP-01, IF-HIS-01
- ตรวจด้วย: AC-BKG-01
- ไฟล์ที่แตะ: `backend/app/booking/service.py`, `backend/app/booking/router.py`, `backend/app/main.py`, `backend/tests/test_AC_BKG_01.py`
- ต้องทำหลัง: T-01, T-02, T-03
- เสร็จเมื่อ: `POST /bookings` บันทึก HN, ตัด `remaining` ของช่วงเวลา และคืนผลการจองสำเร็จโดยไม่เก็บเลขบัตรประชาชน
- สถานะ: พร้อมทำ

### T-06 ป้องกันการจองซ้ำในวันเดียวกัน
- รองรับ: FR-BKG-02, ASM-02, IF-IDP-01
- ตรวจด้วย: AC-BKG-02
- ไฟล์ที่แตะ: `backend/app/booking/service.py`, `backend/app/booking/router.py`, `backend/tests/test_AC_BKG_02.py`
- ต้องทำหลัง: T-05
- เสร็จเมื่อ: การจองซ้ำของ HN ในวันเดียวกันถูกปฏิเสธและ response แสดงหมายเลขคิวเดิมตามข้อมูลที่มี
- สถานะ: พร้อมทำ

### T-07 จัดการกรณีช่วงเวลาเต็มและเสนอช่วงใกล้เคียง
- รองรับ: FR-BKG-03, ASM-02, IF-IDP-01
- ตรวจด้วย: AC-BKG-03
- ไฟล์ที่แตะ: `backend/app/slots/service.py`, `backend/app/booking/service.py`, `backend/app/booking/router.py`, `backend/tests/test_AC_BKG_03.py`
- ต้องทำหลัง: T-03, T-05
- เสร็จเมื่อ: เมื่อช่วงเวลาถูกจองเต็มระหว่างยืนยัน API คืน `409` พร้อมช่วงว่าง 3 ช่วงที่ใกล้ที่สุดภายในวันเดียวกันและวันถัดไป และไม่สร้าง booking ซ้อน
- สถานะ: พร้อมทำ

### T-08 สร้างคิวส่งข้อความยืนยันแบบ asynchronous
- รองรับ: FR-BKG-04, FR-BKG-05, IF-NOT-01, NFR-REL-02, ASM-03
- ตรวจด้วย: AC-BKG-04
- ไฟล์ที่แตะ: `backend/app/notify/queue.py`, `backend/app/booking/service.py`, `backend/tests/test_AC_BKG_04.py`
- ต้องทำหลัง: T-05
- เสร็จเมื่อ: การจองไม่รอผลส่งข้อความ, การส่งที่ล้มเหลวถูกจัดเข้าคิวส่งซ้ำภายใน 5 นาที และ retry ไม่เกิน 3 ครั้งตาม ASM-03
- สถานะ: พร้อมทำ

### T-09 บันทึก audit log เมื่อเข้าถึงข้อมูลการจอง
- รองรับ: DOM-PDPA-01, IF-IDP-01
- ตรวจด้วย: AC-BKG-06
- ไฟล์ที่แตะ: `backend/app/audit/middleware.py`, `backend/app/main.py`, `backend/tests/test_AC_BKG_06.py`
- ต้องทำหลัง: T-01, T-02, T-05
- เสร็จเมื่อ: การเปิดดูข้อมูลการจองสร้าง audit log ที่มีผู้เข้าถึง, เวลา และ HN และข้อมูลถูกเก็บไว้ในระบบอย่างน้อย 1 ปีตามนโยบาย
- สถานะ: พร้อมทำ

### T-10 สร้างตัวเชื่อมต่อค้นหา HN จาก HIS
- รองรับ: IF-HIS-01, IF-IDP-01
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของ T-05 และ T-16
- ไฟล์ที่แตะ: `backend/app/his/client.py`, `backend/app/booking/router.py`, `backend/tests/test_his_lookup.py`
- ต้องทำหลัง: T-02
- เสร็จเมื่อ: `GET /patients/lookup` ส่งเลขบัตรต่อให้ HIS เพื่อคืน HN และไม่มีเลขบัตรถูกบันทึกในตารางการจอง
- สถานะ: พร้อมทำ

### T-11 เพิ่มการตั้งค่า TLS สำหรับการรับส่งข้อมูล
- รองรับ: NFR-SEC-01, IF-IDP-01, IF-NOT-01
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของการเปิดใช้งานระบบ
- ไฟล์ที่แตะ: `backend/app/config.py`, `backend/app/main.py`, `backend/tests/test_security_transport.py`
- ต้องทำหลัง: T-02
- เสร็จเมื่อ: การตั้งค่าการเปิดใช้งานระบบกำหนดให้การรับส่งข้อมูลการจองใช้ TLS 1.2 ขึ้นไป และมี test ตรวจ configuration นี้
- สถานะ: พร้อมทำ

### T-12 เตรียมชุดทดสอบ API และคิวจำลอง
- รองรับ: IF-NOT-01, CON-TECH-01
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของ T-04, T-05, T-07, T-08 และ T-09
- ไฟล์ที่แตะ: `backend/tests/conftest.py`, `backend/tests/test_*.py`
- ต้องทำหลัง: T-01
- เสร็จเมื่อ: ทุก test ใช้ SQLite ในหน่วยความจำและคิวแจ้งเตือนจำลองได้โดยไม่ต้องติดตั้ง PostgreSQL หรือ Redis ใน Codespace
- สถานะ: พร้อมทำ

### T-13 สร้างหน้าจอเลือกแพ็กเกจและช่วงเวลา
- รองรับ: FR-BKG-01, FR-BKG-06, IF-IDP-01
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของ T-14 และ T-17
- ไฟล์ที่แตะ: `frontend/src/pages/SlotPicker.jsx`, `frontend/src/api/client.js`, `frontend/src/App.jsx`, `frontend/src/__tests__/SlotPicker.test.jsx`
- ต้องทำหลัง: ไม่มี
- เสร็จเมื่อ: หน้าจอแสดงช่วงเวลาและที่นั่งคงเหลือจาก mock API และโหลดข้อมูลช่วงเวลาใหม่เมื่อเปลี่ยนแพ็กเกจ
- สถานะ: พร้อมทำ

### T-14 สร้างหน้ายืนยันและแจ้งช่วงเวลาเต็ม
- รองรับ: FR-BKG-03, FR-BKG-04
- ตรวจด้วย: AC-BKG-03
- ไฟล์ที่แตะ: `frontend/src/pages/ConfirmBooking.jsx`, `frontend/src/App.jsx`, `frontend/src/__tests__/AC-BKG-03.test.jsx`
- ต้องทำหลัง: T-13
- เสร็จเมื่อ: mock API ที่ตอบ `409` ทำให้หน้าจอแสดงข้อความ "ช่วงเวลาเต็ม" และตัวเลือกช่วงเวลาว่าง 3 ตัวเลือก
- สถานะ: พร้อมทำ

### T-15 สร้างหน้าผลการจองและกรณีส่งข้อความไม่สำเร็จ
- รองรับ: FR-BKG-04, FR-BKG-05
- ตรวจด้วย: AC-BKG-04
- ไฟล์ที่แตะ: `frontend/src/pages/BookingResult.jsx`, `frontend/src/App.jsx`, `frontend/src/__tests__/AC-BKG-04.test.jsx`
- ต้องทำหลัง: T-14
- เสร็จเมื่อ: mock API ที่แจ้งว่าส่งข้อความไม่สำเร็จยังทำให้หน้าจอแสดงหมายเลขคิวและผลการจอง
- สถานะ: พร้อมทำ

### T-16 ต่อการค้นหา HN และข้อมูลผู้รับบริการเข้ากับ flow
- รองรับ: IF-HIS-01, IF-IDP-01
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของ T-05 และ T-17
- ไฟล์ที่แตะ: `backend/app/his/client.py`, `backend/app/booking/router.py`, `frontend/src/api/client.js`, `backend/tests/test_his_lookup.py`
- ต้องทำหลัง: T-02, T-10
- เสร็จเมื่อ: flow ใช้ HN ที่ได้จาก HIS เป็นตัวอ้างอิงการจอง และไม่ส่งหรือเก็บเลขบัตรใน payload การจอง
- สถานะ: พร้อมทำ

### T-17 ต่อหน้าจอกับ API จริง
- รองรับ: FR-BKG-01, FR-BKG-03, FR-BKG-04, FR-BKG-05, IF-IDP-01
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานเชื่อมต่อของ T-04, T-07, T-08, T-13, T-14 และ T-15
- ไฟล์ที่แตะ: `frontend/src/api/client.js`, `frontend/src/pages/SlotPicker.jsx`, `frontend/src/pages/ConfirmBooking.jsx`, `frontend/src/pages/BookingResult.jsx`, `frontend/src/__tests__/integration.test.jsx`
- ต้องทำหลัง: T-04, T-07, T-08, T-13, T-14, T-15
- เสร็จเมื่อ: หน้าจอเรียก `GET /slots` และ `POST /bookings` ผ่าน `/api` ได้ และแสดงผลสำเร็จหรือกรณีช่วงเวลาเต็มตามสัญญา API ใน plan.md
- สถานะ: พร้อมทำ

### T-18 ทดสอบ usability การจองภายใน 3 นาที
- รองรับ: NFR-USE-01, ASM-05
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นการตรวจ NFR-USE-01
- ไฟล์ที่แตะ: `frontend/src/__tests__/usability.test.jsx`, `docs/srs/README.md`
- ต้องทำหลัง: T-17
- เสร็จเมื่อ: อาสาสมัคร 10 คนที่ไม่เคยใช้ระบบจองคิว 8 คนขึ้นไปทำรายการสำเร็จภายใน 3 นาทีโดยไม่ขอความช่วยเหลือ
- สถานะ: พร้อมทำ

### T-19 กำหนดและทดสอบการออกหมายเลขคิว
- รองรับ: FR-BKG-04, FR-BKG-05, IF-IDP-01
- ตรวจด้วย: AC-BKG-01 และ AC-BKG-04
- ไฟล์ที่แตะ: `backend/app/booking/service.py`, `backend/app/booking/router.py`, `frontend/src/pages/BookingResult.jsx`, `backend/tests/test_queue_number.py`
- ต้องทำหลัง: T-05, T-08, T-17
- เสร็จเมื่อ: ทีมตอบ Q-02 แล้วจึงกำหนดวิธีออกและรูปแบบ `queue_no`, API บันทึกหมายเลขคิวได้ และหน้าจอแสดงหมายเลขคิวตามข้อตกลง
- สถานะ: รอ Q-02

## ตารางตรวจความครบ: Acceptance Criteria

| AC ID | task ที่ตรวจ AC นี้ |
|---|---|
| AC-BKG-01 | T-05, T-19 |
| AC-BKG-02 | T-06 |
| AC-BKG-03 | T-07, T-14 |
| AC-BKG-04 | T-08, T-15, T-19 |
| AC-BKG-05 | T-04 |
| AC-BKG-06 | T-09 |

## ตารางตรวจความครบ: Constraints

| Constraint ID | task ที่ทำให้เป็นจริง |
|---|---|
| CON-TECH-01 | T-01, T-12 |
| DOM-PDPA-01 | T-01, T-09 |
| IF-IDP-01 | T-02, T-04, T-05, T-06, T-07, T-09, T-10, T-11, T-13, T-16, T-17, T-19 |
| IF-HIS-01 | T-01, T-05, T-10, T-16 |
| IF-NOT-01 | T-08, T-11, T-12 |

## สิ่งที่ยังไม่ทำ

- Q-02: หมายเลขคิวรีเซ็ตรายวันหรือนับต่อเนื่อง และมีรูปแบบอย่างไร เช่น `A001`? ต้องถามเจ้าหน้าที่เวชระเบียน
- Task ที่รอ Q-02: T-19
- ส่วนการกำหนดวิธีออกเลขคิวและรูปแบบ `queue_no` จะยังไม่ทำจนกว่าจะได้คำตอบ ห้ามเดาคำตอบแทนทีม
