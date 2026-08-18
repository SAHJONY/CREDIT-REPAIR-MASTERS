import { NextRequest, NextResponse } from 'next/server';

const supported = new Set(['es','fr','pt','de','it','ar','hi','zh','ja','ko','ru','tr','vi','id','pl','nl','he','fa','ur','bn','sw']);
const names: Record<string,string> = {es:'Spanish',fr:'French',pt:'Portuguese',de:'German',it:'Italian',ar:'Arabic',hi:'Hindi',zh:'Simplified Chinese',ja:'Japanese',ko:'Korean',ru:'Russian',tr:'Turkish',vi:'Vietnamese',id:'Indonesian',pl:'Polish',nl:'Dutch',he:'Hebrew',fa:'Persian',ur:'Urdu',bn:'Bengali',sw:'Swahili'};
const RETRY_AFTER_SECONDS = 300;

function cleanStrings(value: unknown) {
  if (!Array.isArray(value)) return [] as string[];
  return [...new Set(value.filter((item): item is string => typeof item === 'string').map((item) => item.trim()).filter(Boolean).map((item) => item.slice(0, 700)))].slice(0, 80);
}

function extractText(data: { output_text?: string; output?: Array<{ content?: Array<{ type?: string; text?: string }> }> }) {
  return data.output_text || data.output?.flatMap((item) => item.content ?? []).find((item) => item.type === 'output_text')?.text || '';
}

function degraded(error: string, status = 502) {
  return NextResponse.json({ error }, {
    status,
    headers: {
      'Cache-Control': 'no-store',
      'Retry-After': String(RETRY_AFTER_SECONDS)
    }
  });
}

export async function POST(request: NextRequest) {
  let body: { locale?: string; strings?: unknown };
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'INVALID_JSON' }, { status: 400 }); }
  const locale = String(body.locale || '').toLowerCase();
  if (!supported.has(locale)) return NextResponse.json({ error: 'UNSUPPORTED_LOCALE' }, { status: 400 });
  const strings = cleanStrings(body.strings);
  if (!strings.length) return NextResponse.json({ translations: {} });

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return degraded('TRANSLATION_SERVICE_NOT_CONFIGURED', 503);
  const model = process.env.OPENAI_TRANSLATION_MODEL || process.env.OPENAI_MODEL || 'gpt-5.6';
  const numbered = strings.map((text, index) => `${index}: ${JSON.stringify(text)}`).join('\n');
  const prompt = `Translate every numbered UI string into ${names[locale]}.\nRules:\n- Return ONLY a valid JSON object whose keys are the numeric indexes and values are translated strings.\n- Translate the complete visible interface meaning naturally and professionally.\n- Preserve brand names, product names, proper names, email addresses, URLs, IDs, account numbers, dates, currency amounts, percentages, placeholders in {{double braces}}, and arrow/check symbols.\n- Preserve concise software/credit-industry terminology.\n- Never omit an index.\n- Do not add commentary.\n\n${numbered}`;

  let response: Response;
  try {
    response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, store: false, instructions: 'You are a precise localization engine for a production credit-services application.', input: prompt })
    });
  } catch {
    console.warn(JSON.stringify({ service: 'credit-repair-masters', event: 'translation.upstream_unreachable', model }));
    return degraded('TRANSLATION_MODEL_UNREACHABLE');
  }

  if (!response.ok) {
    console.warn(JSON.stringify({ service: 'credit-repair-masters', event: 'translation.upstream_failed', model, upstreamStatus: response.status }));
    return degraded(`TRANSLATION_MODEL_FAILED_${response.status}`);
  }

  const data = await response.json() as { output_text?: string; output?: Array<{ content?: Array<{ type?: string; text?: string }> }> };
  const raw = extractText(data).trim().replace(/^```json\s*/i, '').replace(/\s*```$/, '');
  let parsed: Record<string,string>;
  try { parsed = JSON.parse(raw) as Record<string,string>; }
  catch {
    console.warn(JSON.stringify({ service: 'credit-repair-masters', event: 'translation.invalid_json', model }));
    return degraded('TRANSLATION_MODEL_INVALID_JSON');
  }
  const translations: Record<string,string> = {};
  strings.forEach((source, index) => { const translated = parsed[String(index)]; if (typeof translated === 'string' && translated.trim()) translations[source] = translated.trim(); });
  return NextResponse.json({ translations }, { headers: { 'Cache-Control': 'private, max-age=3600' } });
}
