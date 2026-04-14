import satori from 'satori';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { lists } from '$lib/lists/index';

let resvg: typeof import('@resvg/resvg-js') | null = null;
try {
  resvg = await import('@resvg/resvg-js');
} catch {
  // Native binary unavailable — will fall back to SVG
}

const GAME_NAME = 'Common Cents';
const WIDTH = 1200;
const HEIGHT = 630;

// Load font once at module scope. In adapter-node, static files live
// in the 'client' directory next to the server entry point.
let fontData: ArrayBuffer;
try {
  const fontPath = join(process.cwd(), 'client', 'PlayfairDisplay-Bold.ttf');
  const buf = readFileSync(fontPath);
  fontData = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
} catch {
  // Dev mode: static/ is served directly
  const fontPath = join(process.cwd(), 'static', 'PlayfairDisplay-Bold.ttf');
  const buf = readFileSync(fontPath);
  fontData = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
}

const listMap = new Map(lists.map((l) => [l.id, l]));

function buildMarkup(listName?: string, score?: number) {
  const hasInfo = listName || score !== undefined;

  return {
    type: 'div',
    props: {
      style: {
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column' as const,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5e6c8',
        fontFamily: 'Playfair Display',
        padding: '60px',
      },
      children: [
        {
          type: 'div',
          props: {
            style: {
              borderTop: '3px solid #1a1a1a',
              borderBottom: '3px solid #1a1a1a',
              padding: '20px 0',
              marginBottom: hasInfo ? '32px' : '16px',
              textAlign: 'center' as const,
              display: 'flex',
              flexDirection: 'column' as const,
              alignItems: 'center',
            },
            children: [
              {
                type: 'div',
                props: {
                  style: {
                    fontSize: '72px',
                    fontWeight: 900,
                    color: '#1a1a1a',
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase' as const,
                  },
                  children: GAME_NAME,
                },
              },
            ],
          },
        },
        {
          type: 'div',
          props: {
            style: {
              fontSize: '28px',
              color: '#777',
              letterSpacing: '0.18em',
              textTransform: 'uppercase' as const,
              marginBottom: hasInfo ? '40px' : '0',
            },
            children: 'The Top 100 Ranking Game',
          },
        },
        ...(listName
          ? [
              {
                type: 'div',
                props: {
                  style: {
                    fontSize: '40px',
                    fontWeight: 700,
                    color: '#1a1a1a',
                    textAlign: 'center' as const,
                    marginBottom: score !== undefined ? '20px' : '0',
                  },
                  children: listName,
                },
              },
            ]
          : []),
        ...(score !== undefined
          ? [
              {
                type: 'div',
                props: {
                  style: {
                    fontSize: '48px',
                    fontWeight: 900,
                    color: '#8b0000',
                  },
                  children: `Score: ${score.toLocaleString()}`,
                },
              },
            ]
          : []),
      ],
    },
  };
}

export async function GET({ url }) {
  const listParam = url.searchParams.get('list');
  const scoreParam = url.searchParams.get('score');

  const list = listParam ? listMap.get(listParam) : undefined;
  const listName = list?.name;
  const score = scoreParam ? parseInt(scoreParam, 10) : undefined;
  const validScore = score !== undefined && !isNaN(score) ? score : undefined;

  const markup = buildMarkup(listName, validScore);

  const svg = await satori(markup as any, {
    width: WIDTH,
    height: HEIGHT,
    fonts: [
      {
        name: 'Playfair Display',
        data: fontData,
        weight: 700,
        style: 'normal',
      },
    ],
  });

  if (resvg) {
    const renderer = new resvg.Resvg(svg, {
      fitTo: { mode: 'width', value: WIDTH },
    });
    const png = renderer.render().asPng();

    return new Response(png, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=86400',
        'X-Robots-Tag': 'noindex',
      },
    });
  }

  // SVG fallback if resvg native binary is unavailable
  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=86400',
      'X-Robots-Tag': 'noindex',
    },
  });
}
