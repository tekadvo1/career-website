const jobs = [
  { "title": "Developer", "company": "Tech", "startDate": "2024-05", "endDate": "2026-03" }
];

const periods = jobs
  .filter(j => j.startDate && j.endDate)
  .map(j => {
    const [sy, sm] = j.startDate.split('-').map(Number);
    const [ey, em] = j.endDate.split('-').map(Number);
    return { start: sy * 12 + (sm || 1), end: ey * 12 + (em || 12) };
  })
  .filter(p => p.end >= p.start)
  .sort((a, b) => a.start - b.start);

const merged = [];
for (const p of periods) {
  if (merged.length === 0 || p.start > merged[merged.length - 1].end) {
    merged.push({ ...p });
  } else {
    merged[merged.length - 1].end = Math.max(merged[merged.length - 1].end, p.end);
  }
}

const totalMonths = merged.reduce((sum, p) => sum + (p.end - p.start), 0);
console.log('Total Months:', totalMonths);

const monthsInclusive = merged.reduce((sum, p) => sum + (p.end - p.start + 1), 0);
console.log('Total Months (Inclusive):', monthsInclusive);
