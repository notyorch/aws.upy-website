import { marked } from 'marked';

export interface EventSection {
  title: string;
  emoji?: string;
  items: string[];
}

export interface EventMeta {
  slug: string;
  date: string;
  title: string;
  heroTitle?: string;
  subtitle?: string;
  description: string;
  thumbnail?: string;
  meetupUrl?: string;
  calendarIcs?: string;
  location?: string;
  locationUrl?: string;
  locationRegion?: string;
  venue?: string;
  time?: string;
  timeRange?: string;
  level?: string;
  sections?: EventSection[];
  agenda?: string[];
  whyAttend?: string[];
  note?: string;
  terms?: string;
  published?: boolean;
}

export interface Event extends EventMeta {
  dateLabel: string;
  dateFormatted: string;
  bodyHtml: string;
  /** true cuando la fecha/hora de fin del evento ya pasó */
  concluded: boolean;
}

export const EVENT_GRID_SLOTS = 3;

const jsonModules = import.meta.glob('../content/events/*.json', {
  eager: true,
  import: 'default',
}) as Record<string, EventMeta>;

const mdModules = import.meta.glob('../content/events/*.md', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>;

function formatEventDates(date: string) {
  const eventDate = new Date(`${date}T12:00:00`);
  return {
    dateLabel: eventDate
      .toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })
      .replace('.', '')
      .toUpperCase(),
    dateFormatted: eventDate.toLocaleDateString('es-MX', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }),
  };
}

/** Extrae hora de fin (24h) desde timeRange ("10:00 – 11:30") o time ("10:00 a.m."). */
function parseEndHourMinute(meta: EventMeta): { hours: number; minutes: number } {
  const range = meta.timeRange ?? '';
  const rangeMatch = range.match(/(\d{1,2}):(\d{2})\s*[–\-—]\s*(\d{1,2}):(\d{2})/);
  if (rangeMatch) {
    return { hours: Number(rangeMatch[3]), minutes: Number(rangeMatch[4]) };
  }

  const single = meta.time ?? '';
  const singleMatch = single.match(/(\d{1,2}):(\d{2})\s*(a\.?\s*m\.?|p\.?\s*m\.?)?/i);
  if (singleMatch) {
    let hours = Number(singleMatch[1]);
    const minutes = Number(singleMatch[2]);
    const meridiem = (singleMatch[3] ?? '').toLowerCase().replace(/\s/g, '');
    if (meridiem.startsWith('p') && hours < 12) hours += 12;
    if (meridiem.startsWith('a') && hours === 12) hours = 0;
    // Sin hora de fin explícita: asumimos ~2 h después del inicio
    const end = hours * 60 + minutes + 120;
    return { hours: Math.min(23, Math.floor(end / 60)), minutes: end % 60 };
  }

  // Sin hora: el evento concluye al final del día local
  return { hours: 23, minutes: 59 };
}

export function isEventConcluded(meta: Pick<EventMeta, 'date' | 'time' | 'timeRange'>, now = new Date()): boolean {
  const { hours, minutes } = parseEndHourMinute(meta);
  const end = new Date(`${meta.date}T00:00:00`);
  end.setHours(hours, minutes, 0, 0);
  return now.getTime() > end.getTime();
}

function loadEvents(): Event[] {
  return Object.entries(jsonModules)
    .map(([path, meta]) => {
      const slugFromFile = path.split('/').pop()?.replace('.json', '') ?? meta.slug;
      const mdPath = path.replace('.json', '.md');
      const markdown = mdModules[mdPath] ?? '';
      const { dateLabel, dateFormatted } = formatEventDates(meta.date);

      return {
        ...meta,
        slug: meta.slug || slugFromFile,
        dateLabel,
        dateFormatted,
        bodyHtml: markdown ? marked.parse(markdown, { async: false }) as string : '',
        concluded: isEventConcluded(meta),
      };
    })
    .filter((event) => event.published !== false)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

const events = loadEvents();

export function getAllEvents(): Event[] {
  return events;
}

export function getEventBySlug(slug: string): Event | undefined {
  return events.find((event) => event.slug === slug);
}

export function getUpcomingEvents(limit?: number): Event[] {
  const upcoming = events.filter((event) => !event.concluded);
  return limit ? upcoming.slice(0, limit) : upcoming;
}
