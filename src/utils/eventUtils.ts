import type { CampusEvent } from '../types';

export function formatEventDate(dateISO: string): string {
  const [year, month, day] = dateISO.split('-').map(Number);
  if (!year || !month || !day) return dateISO;
  const date = new Date(Date.UTC(year, month - 1, day));
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

export function formatTimeRange(start: string, end: string): string {
  return `${start}–${end}`;
}

export function generatePassCode(eventId: string): string {
  const suffix = Math.floor(1000 + Math.random() * 9000);
  const prefix = eventId.replace(/[^a-zA-Z]/g, '').slice(0, 2).toUpperCase() || 'EV';
  return `CEH-${prefix}${suffix}`;
}

export function downloadEventIcs(event: CampusEvent): void {
  const dateCompact = event.dateISO.replace(/-/g, '');
  const startCompact = event.startTime.replace(':', '') + '00';
  const endCompact = event.endTime.replace(':', '') + '00';
  const safeDesc = event.description.replace(/\n/g, '\\n').replace(/,/g, '\\,');
  const safeLoc = `${event.venue}, ${event.room}`.replace(/,/g, '\\,');

  const icsLines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Campus Event Hub//University Calendar//EN',
    'BEGIN:VEVENT',
    `UID:${event.id}@campuseventhub.edu`,
    `DTSTART:${dateCompact}T${startCompact}`,
    `DTEND:${dateCompact}T${endCompact}`,
    `SUMMARY:${event.title}`,
    `DESCRIPTION:${safeDesc}`,
    `LOCATION:${safeLoc}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([icsLines], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${event.id}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function buildPassMatrix(passCode: string): boolean[][] {
  const size = 9;
  let hash = 2166136261;
  for (let i = 0; i < passCode.length; i++) {
    hash ^= passCode.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  const grid: boolean[][] = [];
  for (let r = 0; r < size; r++) {
    const row: boolean[] = [];
    for (let c = 0; c < size; c++) {
      const isCorner =
        (r < 3 && c < 3) ||
        (r < 3 && c >= size - 3) ||
        (r >= size - 3 && c < 3);
      if (isCorner) {
        const localR = r >= size - 3 ? r - (size - 3) : r;
        const localC = c >= size - 3 ? c - (size - 3) : c;
        row.push(localR === 0 || localR === 2 || localC === 0 || localC === 2 || (localR === 1 && localC === 1));
      } else {
        const bit = ((hash >> ((r * size + c) % 24)) ^ (r * 7 + c * 13)) & 1;
        row.push(bit === 1);
      }
    }
    grid.push(row);
  }
  return grid;
}
