// app/api/news/route.tsx
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@libsql/client';

// Replace with your Turso database credentials
const tursoConfig = {
  url: process.env.TURSO_DB_URL || '',
  authToken: process.env.TURSO_DB_AUTH_TOKEN || '',
};

type NewsItem = {
  title: string;
  link: string;
  description: string;
  pubDate?: string;
  source: string;
};

async function fetchNewsFromRSS(rssUrl: string, source: string): Promise<NewsItem[]> {
  try {
    const response = await fetch(rssUrl, { next: { revalidate: 3600 } }); // Revalidate every hour
    const text = await response.text();

    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(text, "text/xml");
    const items = xmlDoc.querySelectorAll("item");

    const newsItems: NewsItem[] = [];

    items.forEach(item => {
      const title = item.querySelector("title")?.textContent || '';
      const link = item.querySelector("link")?.textContent || '';
      const description = item.querySelector("description")?.textContent || '';
      const pubDate = item.querySelector("pubDate")?.textContent || '';

      newsItems.push({ title, link, description, pubDate, source });
    });

    return newsItems;
  } catch (error) {
    console.error(`Error fetching news from ${source}:`, error);
    return [];
  }
}

async function fetchNewsFromAPI(apiUrl: string, source: string): Promise<NewsItem[]> {
  try {
    const response = await fetch(apiUrl, { next: { revalidate: 3600 } }); // Revalidate every hour
    const data = await response.json();

    if (!Array.isArray(data)) {
      console.error(`API ${source} returned non-array data`);
      return [];
    }

    const newsItems: NewsItem[] = data.map((item: any) => {
      return {
        title: item.title || '',
        link: item.url || item.link || '',
        description: item.description || '',
        pubDate: item.date || item.publishedAt || '',
        source: source,
      };
    });

    return newsItems;
  } catch (error) {
    console.error(`Error fetching news from ${source}:`, error);
    return [];
  }
}

async function insertNewsIntoDatabase(newsItems: NewsItem[]) {
  if (newsItems.length === 0) return;

  const client = createClient(tursoConfig);

  try {
    for (const item of newsItems) {
      await client.execute({
        sql: `INSERT INTO news (title, link, description, pubDate, source) VALUES (?, ?, ?, ?, ?) ON CONFLICT (title, source) DO NOTHING`,
        args: [item.title, item.link, item.description, item.pubDate || null, item.source],
      });
    }
  } catch (error) {
    console.error('Error inserting news into the database:', error);
  } finally {
    await client.close();
  }
}

async function getLatestNewsFromDatabase(): Promise<NewsItem[]> {
    const client = createClient(tursoConfig);
    try {
      const res = await client.execute(`SELECT title, link, description, pubDate, source FROM news ORDER BY pubDate DESC LIMIT 50`);
      const newsItems: NewsItem[] = res.rows.map(row => ({
        title: row[0] as string,
        link: row[1] as string,
        description: row[2] as string,
        pubDate: row[3] as string,
        source: row[4] as string,
      }));
      return newsItems;
    } catch (error) {
      console.error('Error fetching news from the database:', error);
      return [];
    } finally {
      await client.close();
    }
  }

export async function GET(req: NextRequest) {
  try {
    const rssSources = [
      { url: 'https://www.theverge.com/rss/index.xml', source: 'The Verge' },
      { url: 'https://www.wired.com/feed/rss', source: 'Wired' },
    ];

    const apiSources = [
        { url: 'https://newsapi.org/v2/everything?q=technology&apiKey=YOUR_NEWS_API_KEY', source: 'NewsAPI' }, //Replace YOUR_NEWS_API_KEY
    ];

    let allNews: NewsItem[] = [];

    for (const source of rssSources) {
      const news = await fetchNewsFromRSS(source.url, source.source);
      allNews = allNews.concat(news);
    }

    for (const source of apiSources) {
        const news = await fetchNewsFromAPI(source.url, source.source);
        allNews = allNews.concat(news);
      }

    await insertNewsIntoDatabase(allNews);

    const latestNews = await getLatestNewsFromDatabase();

    return NextResponse.json({ news: latestNews }, { status: 200 });

  } catch (error) {
    console.error('Error in GET handler:', error);
    return NextResponse.json({ error: 'Failed to fetch news' }, { status: 500 });
  }
}