const db = require('./index');

const DEFAULT_SLOTS = [
  { start: '12:00', end: '13:00' },
  { start: '13:00', end: '14:00' },
  { start: '14:00', end: '15:00' },
];

async function getSlots() {
  try {
    const res = await db.query("SELECT value FROM settings WHERE key = 'booking_slots'");
    if (res.rows.length) return JSON.parse(res.rows[0].value);
  } catch {}
  return DEFAULT_SLOTS;
}

async function saveSlots(slots) {
  const sorted = [...slots].sort((a, b) => a.start.localeCompare(b.start));
  await db.query(
    "INSERT INTO settings (key,value) VALUES ('booking_slots',$1) ON CONFLICT (key) DO UPDATE SET value=$1",
    [JSON.stringify(sorted)]
  );
  return sorted;
}

function isValidSlot(slots, start, end) {
  return slots.some((s) => s.start === start && s.end === end);
}

module.exports = { getSlots, saveSlots, isValidSlot };
