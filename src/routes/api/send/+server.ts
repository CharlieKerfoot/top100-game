import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
  const body = await request.text();

  const response = await fetch('https://cloud.umami.is/api/send', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'user-agent': request.headers.get('user-agent') ?? ''
    },
    body
  });

  const responseBody = await response.text();

  return new Response(responseBody, {
    status: response.status,
    headers: {
      'content-type': response.headers.get('content-type') ?? 'application/json'
    }
  });
};
