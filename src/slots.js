const dayjs = require('dayjs');

const SLOTS = [
  { start: '12:00', end: '13:00' },
  { start: '13:00', end: '14:00' },
  { start: '14:00', end: '15:00' },
];

function isValidSlot(start, end) {
  return SLOTS.some((s) => s.start === start && s.end === end);
}

function isFriday(dateStr) {
  return dayjs(dateStr).day() === 5;
}

// Check if dateStr falls on the configured booking day (0=Sun..6=Sat)
function isBookingDay(dateStr, dayNum) {
  return dayjs(dateStr).day() === dayNum;
}

// Return the next occurrence of dayNum (0-6) if it is within 7 days from today
function getUpcomingDays(dayNum) {
  let d = dayjs().startOf('day');
  while (d.day() !== dayNum) d = d.add(1, 'day');
  const diff = d.diff(dayjs().startOf('day'), 'day');
  if (diff <= 7) return [d.format('YYYY-MM-DD')];
  return [];
}

// Legacy wrapper kept for backward compat
function getUpcomingFridays() {
  return getUpcomingDays(5);
}

module.exports = { SLOTS, isValidSlot, isFriday, isBookingDay, getUpcomingDays, getUpcomingFridays };
