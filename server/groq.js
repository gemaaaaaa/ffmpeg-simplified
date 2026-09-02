const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'qwen/qwen3.8-27b';

const SYSTEM_PROMPT = [
  'You are an expert FFmpeg CLI assistant.',
  'Convert the user\'s request into a single valid ffmpeg command.',
  'Use sensible defaults (H.264, AAC, CRF 23) unless the user specifies otherwise.',
  'Output ONLY the raw command - no markdown code fences, no backticks, no explanation, no filenames other than placeholders like input.mp4/output.mp4.',
].join(' ');

function cleanCommand(text) {
  return text
    .replace(/```(?:bash|sh|shell)?/gi, '')
    .replace(/```/g, '')
    .replace(/^`|`$/g, '')
    .trim();
}

export async function generateFfmpegCommand(request) {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    throw new Error('Missing GROQ_API_KEY server environment variable');
  }

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: request },
      ],
      temperature: 0.2,
      max_tokens: 512,
      reasoning_effort: 'none',
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Groq API error ${response.status}: ${detail}`);
  }

  const data = await response.json();
  const command = data.choices?.[0]?.message?.content;

  if (!command) {
    throw new Error('Groq returned an empty response');
  }

  return cleanCommand(command);
}
