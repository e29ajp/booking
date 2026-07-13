const router = require('express').Router();
const dayjs = require('dayjs');
const db = require('../db');
const { ensureAuthenticated } = require('../auth');
const { isFriday, getUpcomingFridays } = require('../slots');
const { getSlots, isValidSlot } = require('../db/slots-setting');
const { getBookingRules } = require('../db/booking-rules');

router.get('/', ensureAuthenticated, async (req, res, next) => {
  try {
    const [equipment, myBookings, pastBookings, settingRes, slots] = await Promise.all([
      db.query('SELECT * FROM equipment WHERE active = true ORDER BY name'),
      db.query(
        `SELECT b.*, e.name AS equipment_name FROM bookings b
         JOIN equipment e ON e.id = b.equipment_id
         WHERE b.user_id = $1 AND b.status = 'confirmed' AND b.booking_date >= CURRENT_DATE
         ORDER BY b.booking_date, b.start_time`,
        [req.user.id]
      ),
      db.query(
        `SELECT b.*, e.name AS equipment_name FROM bookings b
         JOIN equipment e ON e.id = b.equipment_id
         WHERE b.user_id = $1 AND b.booking_date < CURRENT_DATE
         ORDER BY b.booking_date DESC, b.start_time DESC LIMIT 10`,
        [req.user.id]
      ),
      db.query("SELECT value FROM settings WHERE key = 'booking_open'"),
      getSlots(),
    ]);

    const bookingOpen = settingRes.rows.length ? settingRes.rows[0].value === 'true' : false;

    res.render('index', {
      user: req.user,
      equipment: equipment.rows,
      myBookings: myBookings.rows,
      pastBookings: pastBookings.rows,
      slots,
      fridays: getUpcomingFridays(),
      bookingOpen,
    });
  } catch (err) {
    next(err);
  }
});

router.get('/equipment/availability', ensureAuthenticated, async (req, res, next) => {
  try {
    const date = req.query.date;
    if (!date) return res.status(400).json({ message: 'กรุณาระบุวันที่' });

    const [equipment, bookingResult, slots] = await Promise.all([
      db.query('SELECT id, capacity FROM equipment WHERE active = true'),
      db.query(
        `SELECT equipment_id, start_time, end_time, COUNT(*)::int AS booked_count
         FROM bookings WHERE booking_date = $1 AND status = 'confirmed'
         GROUP BY equipment_id, start_time, end_time`,
        [date]
      ),
      getSlots(),
    ]);

    const result = {};
    equipment.rows.forEach((e) => {
      const slotCounts = slots.map((s) => {
        const match = bookingResult.rows.find(
          (r) => r.equipment_id === e.id && r.start_time.slice(0, 5) === s.start && r.end_time.slice(0, 5) === s.end
        );
        return { start: s.start, end: s.end, remaining: e.capacity - (match ? match.booked_count : 0) };
      });
      result[e.id] = { capacity: e.capacity, slots: slotCounts };
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.get('/equipment/:id/slots', ensureAuthenticated, async (req, res, next) => {
  try {
    const { id } = req.params;
    const date = req.query.date || dayjs().format('YYYY-MM-DD');

    const [equipmentResult, bookingResult, slots] = await Promise.all([
      db.query('SELECT capacity FROM equipment WHERE id = $1', [id]),
      db.query(
        `SELECT start_time, end_time, COUNT(*)::int AS booked_count
         FROM bookings WHERE equipment_id = $1 AND booking_date = $2 AND status = 'confirmed'
         GROUP BY start_time, end_time`,
        [id, date]
      ),
      getSlots(),
    ]);

    if (!equipmentResult.rows.length) return res.status(404).json({ message: 'ไม่พบเครื่องมือนี้' });
    const capacity = equipmentResult.rows[0].capacity;

    const counts = slots.map((s) => {
      const match = bookingResult.rows.find((r) => r.start_time.slice(0, 5) === s.start && r.end_time.slice(0, 5) === s.end);
      const bookedCount = match ? match.booked_count : 0;
      return { start: s.start, end: s.end, capacity, bookedCount, remaining: capacity - bookedCount };
    });

    res.json(counts);
  } catch (err) {
    next(err);
  }
});

router.post('/bookings', ensureAuthenticated, async (req, res, next) => {
  try {
    const { equipment_id, booking_date, start_time, end_time } = req.body;

    const settingRes = await db.query("SELECT value FROM settings WHERE key = 'booking_open'");
    const bookingOpen = settingRes.rows.length ? settingRes.rows[0].value === 'true' : false;
    if (!bookingOpen) {
      const msg = res.locals.lang === 'en' ? 'Booking is currently closed.' : 'ยังไม่เปิดรับการจองในขณะนี้ กรุณารอให้แอดมินเปิดรับก่อน';
      return res.status(403).render('error', { message: msg });
    }

    if (!equipment_id || !booking_date || !start_time || !end_time) {
      return res.status(400).render('error', { message: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
    }
    if (!isFriday(booking_date)) {
      return res.status(400).render('error', { message: 'จองได้เฉพาะวันศุกร์เท่านั้น' });
    }

    const slots = await getSlots();
    if (!isValidSlot(slots, start_time, end_time)) {
      return res.status(400).render('error', { message: 'กรุณาเลือกสล็อตเวลาที่กำหนดไว้เท่านั้น' });
    }
    if (dayjs(booking_date).isBefore(dayjs().format('YYYY-MM-DD'))) {
      return res.status(400).render('error', { message: 'ไม่สามารถจองย้อนหลังได้' });
    }

    const rules = await getBookingRules();
    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');

      const equipmentResult = await client.query(
        'SELECT capacity FROM equipment WHERE id = $1 AND active = true FOR UPDATE',
        [equipment_id]
      );
      if (!equipmentResult.rows.length) {
        await client.query('ROLLBACK');
        return res.status(404).render('error', { message: 'ไม่พบเครื่องมือนี้ หรือถูกปิดใช้งานแล้ว' });
      }
      const capacity = equipmentResult.rows[0].capacity;

      // Check slot capacity
      const slotCount = await client.query(
        `SELECT COUNT(*)::int AS cnt FROM bookings
         WHERE equipment_id = $1 AND booking_date = $2 AND start_time = $3 AND end_time = $4 AND status = 'confirmed'`,
        [equipment_id, booking_date, start_time, end_time]
      );
      if (slotCount.rows[0].cnt >= capacity) {
        await client.query('ROLLBACK');
        return res.status(409).render('error', { message: 'ช่วงเวลานี้เต็มแล้ว กรุณาเลือกเวลาอื่น' });
      }

      // Check time overlap (same user, same date+slot, different equipment)
      const overlapCheck = await client.query(
        `SELECT id FROM bookings
         WHERE user_id = $1 AND booking_date = $2 AND start_time = $3 AND end_time = $4 AND status = 'confirmed'`,
        [req.user.id, booking_date, start_time, end_time]
      );
      if (overlapCheck.rows.length > 0) {
        await client.query('ROLLBACK');
        const msg = res.locals.lang === 'en'
          ? 'You already have a booking in this time slot. Cannot book overlapping times.'
          : 'คุณมีการจองในช่วงเวลานี้อยู่แล้ว ไม่สามารถจองทับเวลาได้';
        return res.status(409).render('error', { message: msg });
      }

      // Check per-equipment booking limit
      const eqCount = await client.query(
        `SELECT COUNT(*)::int AS cnt FROM bookings
         WHERE user_id = $1 AND equipment_id = $2 AND status = 'confirmed' AND booking_date >= CURRENT_DATE`,
        [req.user.id, equipment_id]
      );
      if (eqCount.rows[0].cnt >= rules.maxPerEquipment) {
        await client.query('ROLLBACK');
        const msg = res.locals.lang === 'en'
          ? `You can only book this equipment up to ${rules.maxPerEquipment} time(s).`
          : `จองเครื่องมือชิ้นเดียวได้ไม่เกิน ${rules.maxPerEquipment} ครั้ง`;
        return res.status(409).render('error', { message: msg });
      }

      // Check total active bookings limit (0 = unlimited)
      if (rules.maxTotal > 0) {
        const totalCount = await client.query(
          `SELECT COUNT(*)::int AS cnt FROM bookings
           WHERE user_id = $1 AND status = 'confirmed' AND booking_date >= CURRENT_DATE`,
          [req.user.id]
        );
        if (totalCount.rows[0].cnt >= rules.maxTotal) {
          await client.query('ROLLBACK');
          const msg = res.locals.lang === 'en'
            ? `You can only have ${rules.maxTotal} active booking(s) at a time.`
            : `จองได้ไม่เกิน ${rules.maxTotal} รายการที่ยังไม่ถึงกำหนด`;
          return res.status(409).render('error', { message: msg });
        }
      }

      await client.query(
        'INSERT INTO bookings (equipment_id, user_id, booking_date, start_time, end_time) VALUES ($1,$2,$3,$4,$5)',
        [equipment_id, req.user.id, booking_date, start_time, end_time]
      );
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }

    res.redirect('/');
  } catch (err) {
    next(err);
  }
});

router.post('/bookings/:id/cancel', ensureAuthenticated, async (req, res, next) => {
  try {
    const { id } = req.params;
    const own = req.user.role === 'admin'
      ? await db.query('SELECT * FROM bookings WHERE id = $1', [id])
      : await db.query('SELECT * FROM bookings WHERE id = $1 AND user_id = $2', [id, req.user.id]);

    if (!own.rows.length) {
      return res.status(404).render('error', { message: 'ไม่พบรายการจองนี้' });
    }

    await db.query("UPDATE bookings SET status = 'cancelled' WHERE id = $1", [id]);
    res.redirect(req.user.role === 'admin' ? '/admin/bookings' : '/');
  } catch (err) {
    next(err);
  }
});

module.exports = router;
