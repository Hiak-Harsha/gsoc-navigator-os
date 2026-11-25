import { api } from './client';

const LOCAL_OLLAMA = 'http://127.0.0.1:11434';
const DEFAULT_MODEL = 'llama3.2:latest';

export async function probeBrowserOllama(): Promise<{ active: boolean; model?: string }> {
  try {
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 1800);
    const resp = await fetch(`${LOCAL_OLLAMA}/api/tags`, { signal: controller.signal });
    window.clearTimeout(timer);
    if (!resp.ok) return { active: false };
    const data = await resp.json();
    const models: string[] = (data?.models || []).map((m: any) => m.name).filter(Boolean);
    const selected = models.includes(DEFAULT_MODEL) ? DEFAULT_MODEL : models[0];
    return { active: models.length > 0, model: selected };
  } catch {
    return { active: false };
  }
}

async function callBrowserOllama(
  messages: Array<{ role: string; content: string }>,
  model: string,
  jsonMode = false
): Promise<string | null> {
  try {
    const resp = await fetch(`${LOCAL_OLLAMA}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages,
        stream: false,
        options: { temperature: 0.25 },
        ...(jsonMode ? { format: 'json' } : {}),
      }),
    });
    if (!resp.ok) return null;
    const data = await resp.json();
    return data?.message?.content?.trim() || null;
  } catch {
    return null;
  }
}

/**
 * Fetches AI suggestions from the backend first; if the backend is running in cloud fallback mode
 * without local Ollama access, automatically bridges via browser -> local Ollama llama3.2:latest.
 */
export async function getSmartSuggestions(): Promise<any> {
  const backendRes = await api.getAiSuggestions();
  if (backendRes?.generated_by && backendRes.generated_by !== 'heuristic') {
    return backendRes;
  }

  const probe = await probeBrowserOllama();
  if (!probe.active || !probe.model || !backendRes?.snapshot) {
    return backendRes;
  }

  const systemPrompt =
    'You are GSoC Copilot inside GSoC Navigator OS. Analyze the live portfolio snapshot and return STRICT JSON: ' +
    '{"headline": string, "priority_action": string, "suggestions": [{"title": string, "reason": string, "action_view": "contributions"|"notifications"|"issues"|"proposals"|"organizations"|"mentor", "urgency": "high"|"medium"|"low"}]}.';

  const raw = await callBrowserOllama(
    [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Live Portfolio Snapshot:\n${JSON.stringify(backendRes.snapshot, null, 2)}` },
    ],
    probe.model,
    true
  );

  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (parsed?.headline && Array.isArray(parsed?.suggestions)) {
        return {
          ...backendRes,
          headline: String(parsed.headline),
          priority_action: String(parsed.priority_action || parsed.suggestions[0]?.title || backendRes.priority_action),
          suggestions: parsed.suggestions.slice(0, 4),
          generated_by: `browser-ollama:${probe.model}`,
        };
      }
    } catch {
      // Keep clean heuristic data
    }
  }
  return backendRes;
}

/**
 * Sends a Copilot Q&A message via backend, with transparent local browser Ollama fallback.
 */
export async function askSmartCopilot(
  question: string,
  history: Array<{ role: string; content: string }>
): Promise<{ answer: string; generated_by: string }> {
  const backendRes = await api.askAiCopilot(question, history);
  if (backendRes?.generated_by && backendRes.generated_by !== 'heuristic') {
    return { answer: backendRes.answer, generated_by: backendRes.generated_by };
  }

  const probe = await probeBrowserOllama();
  if (!probe.active || !probe.model) {
    return { answer: backendRes.answer, generated_by: backendRes.generated_by || 'heuristic' };
  }

  const systemPrompt =
    'You are GSoC Navigator Copilot running locally via Ollama llama3.2. Be crisp, honest, technical, and reference exact PR numbers and actionable steps from the portfolio context.';

  const contextMsg = `Live GSoC Portfolio Context:\n${JSON.stringify(backendRes.snapshot || {}, null, 2)}`;
  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: contextMsg },
    ...history.slice(-4),
    { role: 'user', content: question },
  ];

  const directAnswer = await callBrowserOllama(messages, probe.model, false);
  if (directAnswer) {
    return { answer: directAnswer, generated_by: `browser-ollama:${probe.model}` };
  }

  return { answer: backendRes.answer, generated_by: backendRes.generated_by || 'heuristic' };
}
