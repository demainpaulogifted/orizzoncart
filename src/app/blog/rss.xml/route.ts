import { GET as getRootFeed } from '../../rss.xml/route';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  return getRootFeed(request);
}
