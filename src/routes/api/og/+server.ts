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

function buildMarkup(opts: {
  listName?: string;
  score?: number;
  day?: number;
  percentile?: number;
  maxScore?: number;
}) {
  const { listName, score, day, percentile, maxScore } = opts;
  const hasInfo = listName || score !== undefined;
  const isPersonalized = day !== undefined && score !== undefined;

  const children: any[] = [
    // Header
    {
      type: 'div',
      props: {
        style: {
          borderTop: '3px solid #1a1a1a',
          borderBottom: '3px solid #1a1a1a',
          padding: '20px 0',
          marginBottom: hasInfo ? '24px' : '16px',
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
                fontSize: isPersonalized ? '56px' : '72px',
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
  ];

  // Daily number or tagline
  if (isPersonalized) {
    children.push({
      type: 'div',
      props: {
        style: {
          fontSize: '28px',
          color: '#777',
          letterSpacing: '0.12em',
          textTransform: 'uppercase' as const,
          marginBottom: '24px',
        },
        children: `Daily #${day}`,
      },
    });
  } else {
    children.push({
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
    });
  }

  // List name
  if (listName) {
    children.push({
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
    });
  }

  // Score
  if (score !== undefined) {
    const scoreText = maxScore
      ? `Score: ${score.toLocaleString()}/${maxScore.toLocaleString()}`
      : `Score: ${score.toLocaleString()}`;
    children.push({
      type: 'div',
      props: {
        style: {
          fontSize: '48px',
          fontWeight: 900,
          color: '#8b0000',
          marginBottom: percentile !== undefined ? '16px' : '0',
        },
        children: scoreText,
      },
    });
  }

  // Percentile
  if (percentile !== undefined) {
    children.push({
      type: 'div',
      props: {
        style: {
          fontSize: '30px',
          color: '#555',
        },
        children: `Better than ${percentile}% of players`,
      },
    });
  }

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
      children,
    },
  };
}

export async function GET({ url }) {
  const listParam = url.searchParams.get('list');
  const scoreParam = url.searchParams.get('score');
  const dayParam = url.searchParams.get('day');
  const percentileParam = url.searchParams.get('percentile');

  const list = listParam ? listMap.get(listParam) : undefined;
  const listName = list?.name;
  const score = scoreParam ? parseInt(scoreParam, 10) : undefined;
  const validScore = score !== undefined && !isNaN(score) ? Math.max(0, Math.min(score, 5050)) : undefined;
  const day = dayParam ? parseInt(dayParam, 10) : undefined;
  const validDay = day !== undefined && !isNaN(day) && day > 0 ? day : undefined;
  const percentile = percentileParam ? parseInt(percentileParam, 10) : undefined;
  const validPercentile = percentile !== undefined && !isNaN(percentile) && percentile >= 0 && percentile <= 100 ? percentile : undefined;

  const listSize = list?.items.length ?? 100;
  const maxScore = (listSize * (listSize + 1)) / 2;

  const markup = buildMarkup({
    listName,
    score: validScore,
    day: validDay,
    percentile: validPercentile,
    maxScore: validScore !== undefined ? maxScore : undefined,
  });

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
