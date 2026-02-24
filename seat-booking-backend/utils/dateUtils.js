/**
 * Checks if a date is a weekend (Saturday or Sunday)
 */
function isWeekend(date) {
  const day = new Date(date).getDay();
  return day === 0 || day === 6;
}

/**
 * Checks if current time is after 3PM
 */
function isAfter3PM() {
  const hour = new Date().getHours();
  return hour >= 15;
}

/**
 * Returns the ISO week number for a given date
 */
function getWeekNumber(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  // Thursday in current week decides the year
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const week1 = new Date(d.getFullYear(), 0, 4);
  return (
    1 +
    Math.round(
      ((d.getTime() - week1.getTime()) / 86400000 -
        3 +
        ((week1.getDay() + 6) % 7)) /
        7
    )
  );
}

/**
 * Determines if a user (by batch) is allowed to come in on a given date.
 * Batch schedule (ISO week parity):
 *   BATCH_1 — Odd week:  Mon–Fri   | Even week: Thu–Fri
 *   BATCH_2 — Odd week:  Thu–Fri   | Even week: Mon–Wed
 */
function isUserAllowed(userBatch, date) {
  const weekNumber = getWeekNumber(new Date(date));
  const day = new Date(date).getDay(); // 0=Sun,1=Mon,...,6=Sat

  if (userBatch === "BATCH_1") {
    if (weekNumber % 2 === 1) return day >= 1 && day <= 5; // Mon–Fri
    else return day === 4 || day === 5;                     // Thu–Fri
  }

  if (userBatch === "BATCH_2") {
    if (weekNumber % 2 === 1) return day === 4 || day === 5; // Thu–Fri
    else return day >= 1 && day <= 3;                        // Mon–Wed
  }

  return false;
}

/**
 * Returns the next working day after a given date (skips weekends).
 * Holiday check is done at the controller level via DB.
 */
function getNextWorkingDay(date) {
  const d = new Date(date);
  do {
    d.setDate(d.getDate() + 1);
  } while (d.getDay() === 0 || d.getDay() === 6); // skip Sun & Sat
  return d;
}

module.exports = { isWeekend, isAfter3PM, getWeekNumber, isUserAllowed, getNextWorkingDay };