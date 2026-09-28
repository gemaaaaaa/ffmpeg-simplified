import { generateFfmpegCommand } from '../../../server/groq.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const request = req.body?.request;

  if (typeof request !== 'string' || !request.trim()) {
    return res.status(400).json({ error: 'Missing "request" in request body' });
  }

  try {
    const command = await generateFfmpegCommand(request);
    return res.status(200).json({ command });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Failed to generate command' });
  }
}
