import sitemap from '../sitemap';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const entries = await sitemap();
    const body = entries.map((entry) => entry.url).join('\n');

    return new Response(body + '\n', {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'public, max-age=300, s-maxage=300',
      },
    });
  } catch (error) {
    console.error('Text sitemap generation failed:', error);
    return new Response('Sitemap temporarily unavailable.', { status: 500 });
  }
}
