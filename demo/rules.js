// Core report rules, re-implemented with made-up data (no client code).

const DAY = 24 * 60 * 60 * 1000;

// A report goes out on weekdays that are not French public holidays.
function isReportDay(date, holidays = new Set()) {
  const dow = date.getUTCDay();
  return dow !== 0 && dow !== 6 && !holidays.has(date.toISOString().slice(0, 10));
}

// One rule covers Mondays and post-holiday days:
// daysBack = 1 + every non-report day just before today.
function daysBack(today, holidays = new Set()) {
  let n = 1;
  let d = new Date(today.getTime() - DAY);
  while (!isReportDay(d, holidays)) {
    n += 1;
    d = new Date(d.getTime() - DAY);
  }
  return n;
}

// Window: (today - daysBack) 08:00 -> today 08:00, Paris time.
function reportWindow(today, holidays) {
  const end = parisEightAm(today);
  const start = parisEightAm(new Date(today.getTime() - daysBack(today, holidays) * DAY));
  return { start, end };
}

// 08:00 in Europe/Paris on the given calendar day, returned as a UTC Date (handles DST).
function parisEightAm(day) {
  const ymd = day.toISOString().slice(0, 10);
  const guess = new Date(`${ymd}T08:00:00Z`);
  const parisHour = Number(
    new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Paris', hour: '2-digit', hour12: false }).format(guess)
  );
  return new Date(guess.getTime() - (parisHour - 8) * 60 * 60 * 1000);
}

// Status icon is decided by code, never by a model.
// runs: [{ status: 'OK' | 'KO', at: Date }], expected: scheduled runs expected in the window.
function statusIcon(runs, expected = 0) {
  if (runs.length < expected) return '⚠';
  const sorted = [...runs].sort((a, b) => a.at - b.at);
  const lastKo = sorted.map((r) => r.status).lastIndexOf('KO');
  if (lastKo === -1) return '☀';
  return sorted.slice(lastKo + 1).some((r) => r.status === 'OK') ? '⛅' : '❌';
}

module.exports = { isReportDay, daysBack, reportWindow, statusIcon };
