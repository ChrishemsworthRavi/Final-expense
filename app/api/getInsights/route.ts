import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export const dynamic = 'force-dynamic';

console.log("💡 OPENAI KEY USED:", process.env.OPENAI_API_KEY);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Use the correct key
});

export async function POST(req: NextRequest) {
  console.log('\n[⚡ GET INSIGHTS] Incoming POST request...');

  try {
    const body = await req.json();
    console.log('[📝 Request Body]', body);

    const { expenses } = body;

    if (!expenses || !Array.isArray(expenses) || expenses.length === 0) {
      console.warn('[⚠️ Validation] No valid expenses provided.');
      return NextResponse.json(
        { error: 'No valid expenses provided' },
        { status: 400 }
      );
    }

    console.log(`[📦 Expenses Received] Count: ${expenses.length}`);

    // Simulated loading logs (just for backend dev vibes)
    console.log('🧠 Step 1: Formatting expense records...');
    await new Promise((res) => setTimeout(res, 300));

    console.log('📊 Step 2: Categorizing and estimating trends...');
    await new Promise((res) => setTimeout(res, 500));

    console.log('🤖 Step 3: Sending data to OpenAI...');
    await new Promise((res) => setTimeout(res, 300));

    const formattedExpenses = expenses
      .slice(0, 20)
      .map(
        (e: any) =>
          `${e.category || 'Unknown'} | ${e.amount || 0} | ${e.date || 'N/A'} | ${e.type || 'N/A'}`
      );

    const prompt = `You are a financial advisor AI. Based on the following expense data, generate 3 smart insights.

Each insight must include:
- title
- description
- impact (High, Medium, Low)
- potential savings (in dollars)
- type (warning, opportunity, positive)

Respond ONLY with a JSON array. No explanation, no markdown.

Here is the data:
${formattedExpenses.join('\n')}`;

    console.log('[🧠 Sending Prompt to OpenAI] Prompt length:', prompt.length);

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    });

    const raw = completion.choices[0].message?.content?.trim() || '';
    console.log('[📨 Raw OpenAI Response]', raw);

let insights;

try {
  insights = JSON.parse(raw);

  if (!Array.isArray(insights)) throw new Error('OpenAI response is not an array');

const validInsights = insights
  .filter((i) =>
    typeof i.title === 'string' &&
    typeof i.description === 'string' &&
    typeof i.impact === 'string' &&
    typeof i.type === 'string' &&
    (
      typeof i.potential_savings === 'number' ||
      typeof i.potentialSavings === 'number' ||
      typeof i["potential savings"] === 'number' ||
      typeof i.potential_savings === 'string' ||
      typeof i.potentialSavings === 'string' ||
      typeof i["potential savings"] === 'string'
    )
  )
  .map((i) => {
    const rawValue =
      i.potential_savings ??
      i.potentialSavings ??
      i["potential savings"];

    const numericValue = typeof rawValue === 'string'
      ? parseFloat(rawValue.replace(/[^0-9.-]/g, ''))
      : rawValue;

    return {
      title: i.title,
      description: i.description,
      impact: i.impact,
      type: i.type,
      savings: `$${isNaN(numericValue) ? 0 : numericValue}`,
    };
  });

  console.log(`[✓ Parsed Insights] ${validInsights.length} valid entries`);
  insights = validInsights;
} catch (parseErr: any) {
  console.warn('[✗ JSON Parse Failed] Fallback insight returned.');
  console.warn('[✗ Problematic Raw JSON]', raw);
  insights = [
    {
      title: 'AI Suggestion',
      description: raw,
      impact: 'Medium',
      savings: '$0',
      type: 'opportunity',
    },
  ];
}


    console.log('[✅ Success] Returning insights to client.');
    return NextResponse.json(insights);
  } catch (err: any) {
    console.error('[🔥 Server Error]', err);
    return NextResponse.json(
      {
        error: 'Internal error generating insights',
        details: err.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}
