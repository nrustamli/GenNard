import type { ThemeGenerationRequest, ThemeGenerationResponse } from '../../../../shared/themeTypes';

export async function generateTheme(
  request: ThemeGenerationRequest,
): Promise<ThemeGenerationResponse> {
  const res = await fetch('/api/generate-theme', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error ?? `Theme generation failed (${res.status})`);
  }

  return res.json();
}
