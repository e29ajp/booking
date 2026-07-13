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

// Only return the next Friday if it is within 7 days from today
function getUpcomingFridays() {
  let d = dayjs().startOf('day');
  while (d.day() !== 5) d = d.add(1, 'day');
  const diff = d.diff(dayjs().startOf('day'), 'day');
  if (diff <= 7) return [d.format('YYYY-MM-DD')];
  return [];
}

module.exports = { SLOTS, isValidSlot, isFriday, getUpcomingFridays };
