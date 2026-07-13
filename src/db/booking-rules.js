const db = require('./index');

async function getBookingRules() {
  const { rows } = await db.query(
    "SELECT key, value FROM settings WHERE key IN ('max_bookings_per_equipment','max_total_bookings')"
  );
  const map = Object.fromEntries(rows.map((r) => [r.key, parseInt(r.value, 10)]));
  return {
    maxPerEquipment: map.max_bookings_per_equipment ?? 2,
    maxTotal: map.max_total_bookings ?? 0, // 0 = unlimited
  };
}

async function saveBookingRules({ maxPerEquipment, maxTotal }) {
  await db.query(
    "INSERT INTO settings (key,value) VALUES ('max_bookings_per_equipment',$1) ON CONFLICT (key) DO UPDATE SET value=$1",
    [String(maxPerEquipment)]
  );
  await db.query(
    "INSERT INTO settings (key,value) VALUES ('max_total_bookings',$1) ON CONFLICT (key) DO UPDATE SET value=$1",
    [String(maxTotal)]
  );
}

module.exports = { getBookingRules, saveBookingRules };
