import { CalendarEvent } from "../types";

// Helper to format date for ICS
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
};

const generateEventBlock = (event: CalendarEvent, now: string) => {
  const start = formatDate(event.start);
  const end = formatDate(event.end);
  
  // Generate Alarm blocks
  const alarmBlocks = (event.alarms || []).map(minutes => {
    return [
      'BEGIN:VALARM',
      'TRIGGER:-PT' + minutes + 'M',
      'ACTION:DISPLAY',
      'DESCRIPTION:Reminder',
      'END:VALARM'
    ].join('\r\n');
  }).join('\r\n');

  return [
    'BEGIN:VEVENT',
    `UID:${event.id}@chronos.app`,
    `DTSTAMP:${now}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${event.title}`,
    `DESCRIPTION:${event.description || ''}`,
    `LOCATION:${event.location || ''}`,
    'STATUS:CONFIRMED',
    alarmBlocks,
    'END:VEVENT'
  ].filter(line => line).join('\r\n');
};

export const downloadICS = (event: CalendarEvent) => {
  const now = formatDate(new Date().toISOString());
  const eventBlock = generateEventBlock(event, now);

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Chronos//Gemini Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    eventBlock,
    'END:VCALENDAR'
  ].join('\r\n');

  triggerDownload(icsContent, `${event.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.ics`);
};

export const downloadFullCalendarICS = (events: CalendarEvent[]) => {
  if (events.length === 0) return;

  const now = formatDate(new Date().toISOString());
  const eventBlocks = events.map(e => generateEventBlock(e, now)).join('\r\n');

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Chronos//Gemini Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Chronos Calendar',
    eventBlocks,
    'END:VCALENDAR'
  ].join('\r\n');

  triggerDownload(icsContent, 'chronos_full_calendar.ics');
};

const triggerDownload = (content: string, filename: string) => {
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = window.URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};