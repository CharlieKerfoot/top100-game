import { Resend } from 'resend';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';

const CONTACT_TO = env.CONTACT_EMAIL ?? '';

export const POST: RequestHandler = async ({ request }) => {
  const apiKey = env.RESEND_API_KEY;
  if (!apiKey || !CONTACT_TO) {
    return new Response(JSON.stringify({ error: 'Contact form is not configured.' }), {
      status: 503,
      headers: { 'content-type': 'application/json' },
    });
  }

  let body: { name: string; email: string; subject: string; message: string };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request.' }), {
      status: 400,
      headers: { 'content-type': 'application/json' },
    });
  }

  const { name, email, subject, message } = body;
  if (!name?.trim() || !email?.trim() || !subject?.trim() || !message?.trim()) {
    return new Response(JSON.stringify({ error: 'All fields are required.' }), {
      status: 400,
      headers: { 'content-type': 'application/json' },
    });
  }

  const resend = new Resend(apiKey);

  try {
    await resend.emails.send({
      from: `Common Cents <${env.RESEND_FROM ?? 'noreply@commoncents.fun'}>`,
      to: CONTACT_TO,
      replyTo: email.trim(),
      subject: `[Common Cents] ${subject.trim()}`,
      text: `From: ${name.trim()} <${email.trim()}>\n\n${message.trim()}`,
    });
  } catch {
    return new Response(JSON.stringify({ error: 'Failed to send message. Please try again.' }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });
};
