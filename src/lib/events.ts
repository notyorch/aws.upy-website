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
  return limit ? events.slice(0, limit) : events;
}
