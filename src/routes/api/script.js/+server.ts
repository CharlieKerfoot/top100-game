export async function GET() {
  const response = await fetch('https://cloud.umami.is/script.js');
  const script = await response.text();

  return new Response(script, {
    headers: {
      'content-type': 'application/javascript',
      'cache-control': 'public, max-age=86400'
    }
  });
}
