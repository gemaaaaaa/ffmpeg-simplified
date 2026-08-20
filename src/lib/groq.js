export async function generateFfmpegCommand(request) {
  const response = await fetch('/api/v1/ffmpeg/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ request }),
  });

  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const data = await response.json();
      if (data?.error) message = data.error;
    } catch {
      // non-JSON error body
    }
    throw new Error(message);
  }

  const data = await response.json();
  const command = data.command;

  if (!command) {
    throw new Error('Server returned an empty response');
  }

  return command;
}