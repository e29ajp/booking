const router = require('express').Router();
const db = require('../db');
const { ensureAdmin } = require('../auth');
const { getUpcomingFridays, getUpcomingDays } = require('../slots');
const { getSlots, saveSlots } = require('../db/slots-setting');
const { getBookingRules, saveBookingRules } = require('../db/booking-rules');
const { getBookingDay, saveBookingDay } = require('../db/booking-day');

router.get('/admin', ensureAdmin, async (req, res, next) => {
  try {
    const [equipment, settingRes, slots, rules, bookingDay] = await Promise.all([
      db.query('SELECT * FROM equipment ORDER BY id'),
      db.query("SELECT value FROM settings WHERE key = 'booking_open'"),
      getSlots(),
      getBookingRules(),
      getBookingDay(),
    ]);
    const bookingOpen = settingRes.rows.length ? settingRes.rows[0].value === 'true' : false;
    res.render('admin_equipment', { user: req.user, equipment: equipment.rows, bookingOpen, slots, rules, bookingDay });
  } catch (err) {
    next(err);
  }
});

// Save booking day
router.post('/admin/booking-day', ensureAdmin, async (req, res, next) => {
  try {
    await saveBookingDay(req.body.booking_day);
    res.redirect('/admin');
  } catch (err) {
    next(err);
  }
});

// Save booking rules
router.post('/admin/rules', ensureAdmin, async (req, res, next) => {
  try {
    const maxPerEquipment = Math.max(1, parseInt(req.body.max_per_equipment, 10) || 2);
    const maxTotal = Math.max(0, parseInt(req.body.max_total, 10) || 0);
    await saveBookingRules({ maxPerEquipment, maxTotal });
    res.redirect('/admin');
  } catch (err) {
    next(err);
  }
});

// Add slot
router.post('/admin/slots/add', ensureAdmin, async (req, res, next) => {
  try {
    const { start, end } = req.body;
    if (!start || !end || start >= end) return res.redirect('/admin');
    const slots = await getSlots();
    const exists = slots.some((s) => s.start === start && s.end === end);
    if (!exists) await saveSlots([...slots, { start, end }]);
    res.redirect('/admin');
  } catch (err) {
    next(err);
  }
});

// Delete slot
router.post('/admin/slots/delete', ensureAdmin, async (req, res, next) => {
  try {
    const { start, end } = req.body;
    const slots = await getSlots();
    await saveSlots(slots.filter((s) => !(s.start === start && s.end === end)));
    res.redirect('/admin');
  } catch (err) {
    next(err);
  }
});

router.post('/admin/booking-toggle', ensureAdmin, async (req, res, next) => {
  try {
    const settingRes = await db.query("SELECT value FROM settings WHERE key = 'booking_open'");
    const current = settingRes.rows.length ? settingRes.rows[0].value === 'true' : false;
    await db.query("INSERT INTO settings (key,value) VALUES ('booking_open',$1) ON CONFLICT (key) DO UPDATE SET value=$1", [current ? 'false' : 'true']);
    res.redirect('/admin');
  } catch (err) {
    next(err);
  }
});

router.post('/admin/equipment', ensureAdmin, async (req, res, next) => {
  try {
    const { name, description, capacity } = req.body;
    const cap = parseInt(capacity, 10);
    if (!name) return res.status(400).render('error', { message: 'กรุณาระบุชื่อเครื่องมือ' });
    if (!cap || cap < 1) return res.status(400).render('error', { message: 'กรุณาระบุจำนวนที่นั่ง/เครื่องเป็นจำนวนเต็มมากกว่า 0' });
    await db.query('INSERT INTO equipment (name, description, capacity) VALUES ($1, $2, $3)', [name, description || null, cap]);
    res.redirect('/admin');
  } catch (err) {
    next(err);
  }
});

router.post('/admin/equipment/:id/capacity', ensureAdmin, async (req, res, next) => {
  try {
    const cap = parseInt(req.body.capacity, 10);
    if (!cap || cap < 1) return res.status(400).render('error', { message: 'กรุณาระบุจำนวนที่นั่ง/เครื่องเป็นจำนวนเต็มมากกว่า 0' });
    await db.query('UPDATE equipment SET capacity = $1 WHERE id = $2', [cap, req.params.id]);
    res.redirect('/admin');
  } catch (err) {
    next(err);
  }
});

router.post('/admin/equipment/:id/toggle', ensureAdmin, async (req, res, next) => {
  try {
    await db.query('UPDATE equipment SET active = NOT active WHERE id = $1', [req.params.id]);
    res.redirect('/admin');
  } catch (err) {
    next(err);
  }
});

router.post('/admin/equipment/:id/delete', ensureAdmin, async (req, res, next) => {
  try {
    await db.query('DELETE FROM equipment WHERE id = $1', [req.params.id]);
    res.redirect('/admin');
  } catch (err) {
    next(err);
  }
});

router.get('/admin/bookings', ensureAdmin, async (req, res, next) => {
  try {
    const slots = await getSlots();
    const equipmentRes = await db.query('SELECT * FROM equipment WHERE active = true ORDER BY name');
    const { rows: bookingRows } = await db.query(
      `SELECT b.id, b.booking_date, b.start_time, b.end_time, b.equipment_id,
              e.name AS equipment_name, e.capacity,
              u.name AS user_name, u.email AS user_email
       FROM bookings b
       JOIN equipment e ON e.id = b.equipment_id
       JOIN users u ON u.id = b.user_id
       WHERE b.status = 'confirmed' AND b.booking_date >= CURRENT_DATE
       ORDER BY b.booking_date, e.name, b.start_time`
    );

    // Build weeks map: date -> equipment -> slot -> bookings
    const weeksMap = {};
    bookingRows.forEach((b) => {
      const date = b.booking_date.toISOString().slice(0, 10);
      if (!weeksMap[date]) weeksMap[date] = {};
      const eqKey = b.equipment_id;
      if (!weeksMap[date][eqKey]) {
        weeksMap[date][eqKey] = { id: eqKey, name: b.equipment_name, capacity: b.capacity, slots: {} };
      }
      const slotKey = `${b.start_time.slice(0,5)}-${b.end_time.slice(0,5)}`;
      if (!weeksMap[date][eqKey].slots[slotKey]) {
        weeksMap[date][eqKey].slots[slotKey] = { start: b.start_time.slice(0,5), end: b.end_time.slice(0,5), bookings: [] };
      }
      weeksMap[date][eqKey].slots[slotKey].bookings.push({ id: b.id, name: b.user_name, email: b.user_email });
    });

    // All active equipment (include those with 0 bookings)
    const allEquipment = equipmentRes.rows;

    // Convert to sorted array of weeks
    const weeks = Object.keys(weeksMap).sort().map((date) => {
      const eqMap = weeksMap[date];
      const equipment = allEquipment.map((e) => {
        const eq = eqMap[e.id] || { id: e.id, name: e.name, capacity: e.capacity, slots: {} };
        const slots = Object.values(eq.slots).map((s) => ({
          ...s,
          booked: s.bookings.length,
          pct: Math.round((s.bookings.length / e.capacity) * 100),
        }));
        const totalSlots = slots.length;
        const totalSeats = e.capacity * totalSlots;
        const totalBooked = slots.reduce((sum, s) => sum + s.booked, 0);
        return { id: e.id, name: e.name, capacity: e.capacity, slots, totalBooked, totalSeats, pct: Math.round((totalBooked / totalSeats) * 100) };
      });
      return { date, equipment };
    });

    // Also collect weeks that have NO bookings yet from upcoming booking days
    const bookingDay = await getBookingDay();
    const upcomingFridays = getUpcomingDays(bookingDay);
    upcomingFridays.forEach((date) => {
      if (!weeksMap[date]) {
        weeks.push({
          date,
          equipment: allEquipment.map((e) => ({
            id: e.id, name: e.name, capacity: e.capacity,
            slots: [], totalBooked: 0, totalSeats: e.capacity * slots.length, pct: 0,
          })),
        });
      }
    });
    weeks.sort((a, b) => a.date.localeCompare(b.date));

    res.render('admin_bookings', { user: req.user, weeks, allEquipment, slots });
  } catch (err) {
    next(err);
  }
});

router.get('/admin/users', ensureAdmin, async (req, res, next) => {
  try {
    const rules = await getBookingRules();

    // All users who have ever booked, sorted by active bookings desc
    const { rows: userRows } = await db.query(
      `SELECT u.id, u.name, u.email, u.avatar_url,
              COUNT(b.id) FILTER (WHERE b.status='confirmed' AND b.booking_date >= CURRENT_DATE)::int AS active_count,
              COUNT(b.id) FILTER (WHERE b.status='confirmed')::int AS total_count
       FROM users u
       LEFT JOIN bookings b ON b.user_id = u.id
       WHERE u.role != 'admin'
       GROUP BY u.id
       ORDER BY active_count DESC, total_count DESC, u.name`
    );

    const equipmentRes = await db.query('SELECT * FROM equipment WHERE active = true ORDER BY name');

    // Per-user equipment breakdown (active future bookings only)
    const { rows: detailRows } = await db.query(
      `SELECT b.user_id, e.name AS equipment_name,
              b.booking_date, b.start_time, b.end_time, b.status, b.id AS booking_id
       FROM bookings b
       JOIN equipment e ON e.id = b.equipment_id
       WHERE b.status = 'confirmed' AND b.booking_date >= CURRENT_DATE
       ORDER BY b.user_id, b.booking_date, b.start_time`
    );

    // Group details by user_id
    const detailMap = {};
    detailRows.forEach((d) => {
      if (!detailMap[d.user_id]) detailMap[d.user_id] = [];
      detailMap[d.user_id].push(d);
    });

    // Per-user per-equipment count (all confirmed, not expired)
    const { rows: eqCountRows } = await db.query(
      `SELECT b.user_id, e.name AS equipment_name, COUNT(*)::int AS cnt
       FROM bookings b
       JOIN equipment e ON e.id = b.equipment_id
       WHERE b.status = 'confirmed' AND b.booking_date >= CURRENT_DATE
       GROUP BY b.user_id, e.name`
    );
    const eqCountMap = {};
    eqCountRows.forEach((r) => {
      if (!eqCountMap[r.user_id]) eqCountMap[r.user_id] = {};
      eqCountMap[r.user_id][r.equipment_name] = r.cnt;
    });

    const users = userRows.map((u) => ({
      ...u,
      bookings: detailMap[u.id] || [],
      eqCounts: eqCountMap[u.id] || {},
    }));

    res.render('admin_users', { user: req.user, users, rules, equipment: equipmentRes.rows });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
