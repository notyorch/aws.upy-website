import { marked } from 'marked';

export interface BlogMeta {
  slug: string;
  date: string;
  title: string;
  description: string;
  author?: string;
  tags?: string[];
  thumbnail?: string;
  /** Si true, muestra el cuadro de embed (placeholder o post) aunque no haya URL aún */
  instagramSlot?: boolean;
  /** URL de post de Instagram para incrustar (opcional) */
  instagramUrl?: string;
  published?: boolean;
}

export interface BlogPost extends BlogMeta {
  dateLabel: string;
  dateFormatted: string;
  bodyHtml: string;
}

const jsonModules = import.meta.glob('../content/blog/*.json', {
  eager: true,
  import: 'default',
}) as Record<string, BlogMeta>;

const mdModules = import.meta.glob('../content/blog/*.md', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>;

function formatPostDates(date: string) {
  const postDate = new Date(`${date}T12:00:00`);
  return {
    dateLabel: postDate
      .toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })
      .replace('.', '')
      .toUpperCase(),
    dateFormatted: postDate.toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }),
  };
}

function loadPosts(): BlogPost[] {
  return Object.entries(jsonModules)
    .map(([path, meta]) => {
      const slugFromFile = path.split('/').pop()?.replace('.json', '') ?? meta.slug;
      const mdPath = path.replace('.json', '.md');
      const markdown = mdModules[mdPath] ?? '';
      const { dateLabel, dateFormatted } = formatPostDates(meta.date);

      return {
        ...meta,
        slug: meta.slug || slugFromFile,
        dateLabel,
        dateFormatted,
        bodyHtml: markdown ? (marked.parse(markdown, { async: false }) as string) : '',
      };
    })
    .filter((post) => post.published !== false)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

const posts = loadPosts();

export function getAllPosts(): BlogPost[] {
  return posts;
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return posts.find((post) => post.slug === slug);
}

export interface BlogYearGroup {
  year: string;
  posts: BlogPost[];
}

export function getPostsGroupedByYear(): BlogYearGroup[] {
  const map = new Map<string, BlogPost[]>();

  for (const post of posts) {
    const year = post.date.slice(0, 4);
    const yearPosts = map.get(year) ?? [];
    yearPosts.push(post);
    map.set(year, yearPosts);
  }

  return [...map.entries()]
    .sort(([a], [b]) => Number(b) - Number(a))
    .map(([year, yearPosts]) => ({ year, posts: yearPosts }));
}
