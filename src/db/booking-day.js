const db = require('../db');

// Day 0=Sun 1=Mon 2=Tue 3=Wed 4=Thu 5=Fri 6=Sat  (default: 5 = Friday)
async function getBookingDay() {
  const res = await db.query("SELECT value FROM settings WHERE key = 'booking_day'");
  if (!res.rows.length) return 5;
  const v = parseInt(res.rows[0].value, 10);
  return isNaN(v) ? 5 : v;
}

async function saveBookingDay(day) {
  const v = Math.max(0, Math.min(6, parseInt(day, 10)));
  await db.query(
    "INSERT INTO settings (key,value) VALUES ('booking_day',$1) ON CONFLICT (key) DO UPDATE SET value=$1",
    [String(v)]
  );
}

module.exports = { getBookingDay, saveBookingDay };
