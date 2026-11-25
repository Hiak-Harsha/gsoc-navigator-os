import React, { useEffect, useState } from 'react';
import { ArrowRight, Bot, RefreshCw, Send, Sparkles } from 'lucide-react';
import { Sheet } from './ui/Sheet';
import { Badge, type BadgeTone } from './ui/Badge';
import { Button } from './ui/Button';
import { askSmartCopilot, getSmartSuggestions } from '../api/ollamaBridge';
import { cn } from '../lib/utils';

export interface CopilotSheetProps {
  open: boolean;
  onClose: () => void;
  onNavigate: (viewId: string) => void;
  showToast?: (msg: string, error?: boolean) => void;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  source?: string;
}

const QUICK_PROMPTS = [
  'Summarize the live status of my 4 PRs',
  'Which CI issue or task should I tackle first?',
  'How does my readiness look for SymPy & SunPy?',
];

export const CopilotSheet: React.FC<CopilotSheetProps> = ({
  open,
  onClose,
  onNavigate,
  showToast,
}) => {
  const [suggestionsData, setSuggestionsData] = useState<any>(null);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);

  const fetchSuggestions = async () => {
    try {
      setLoadingSuggestions(true);
      const data = await getSmartSuggestions();
      setSuggestionsData(data);
    } catch (err) {
      console.error(err);
      showToast?.('Failed to fetch Ollama suggestions', true);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  useEffect(() => {
    if (open && !suggestionsData) {
      fetchSuggestions();
    }
  }, [open]);

  const handleSend = async (promptText?: string) => {
    const q = (promptText ?? input).trim();
    if (!q || sending) return;

    const nextHistory = [...messages, { role: 'user' as const, content: q }];
    setMessages(nextHistory);
    if (!promptText) setInput('');
    setSending(true);

    try {
      const res = await askSmartCopilot(
        q,
        nextHistory.map((m) => ({ role: m.role, content: m.content }))
      );
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: res.answer, source: res.generated_by },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: err?.message || 'Could not reach AI Copilot.', source: 'error' },
      ]);
    } finally {
      setSending(false);
    }
  };

  const genSource = suggestionsData?.generated_by || 'checking...';
  const isOllamaActive = String(genSource).includes('ollama');

  return (
    <Sheet
      open={open}
      onClose={onClose}
      eyebrow="Local Intelligence · Live Portfolio Grounded"
      title="Ollama GSoC Copilot"
      subtitle={`Model Engine: ${genSource}`}
      widthClass="max-w-[660px]"
      headerActions={
        <>
          <Badge tone={isOllamaActive ? 'emerald' : 'accent'} className="font-mono">
            <Bot className="h-3 w-3" />
            {isOllamaActive ? genSource : 'Hybrid Engine'}
          </Badge>
          <Button variant="secondary" size="sm" onClick={fetchSuggestions} disabled={loadingSuggestions}>
            <RefreshCw className={cn('h-3.5 w-3.5', loadingSuggestions && 'animate-spin')} />
            <span>{loadingSuggestions ? 'Thinking...' : 'Refresh Suggestions'}</span>
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        {/* Proactive Suggestions Panel */}
        <section className="rounded-2xl border bg-[var(--surface-elevated)] p-4 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--accent-bright)]">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Proactive Intelligence &amp; Next Actions</span>
            </div>
            {loadingSuggestions && (
              <span className="font-mono text-[10.5px] text-[var(--ink-muted)]">Analyzing live telemetry...</span>
            )}
          </div>

          {suggestionsData && (
            <>
              <div className="rounded-xl border bg-[var(--surface)] p-3 space-y-1">
                <div className="text-[13px] font-semibold text-[var(--ink)]">
                  {suggestionsData.headline}
                </div>
                <div className="text-[12px] text-[var(--accent-bright)]">
                  <strong>Priority:</strong> {suggestionsData.priority_action}
                </div>
              </div>

              <div className="space-y-2">
                {suggestionsData.suggestions?.map((sug: any, idx: number) => {
                  const uTone: BadgeTone =
                    sug.urgency === 'high' ? 'rose' : sug.urgency === 'medium' ? 'amber' : 'accent';
                  return (
                    <div
                      key={idx}
                      className="flex items-start justify-between gap-3 rounded-xl border bg-[var(--surface)] p-3 transition-colors hover:border-[var(--border-strong)]"
                    >
                      <div className="min-w-0 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge tone={uTone} className="font-mono uppercase text-[10px]">
                            {sug.urgency || 'medium'}
                          </Badge>
                          <span className="text-[13px] font-semibold text-[var(--ink)]">{sug.title}</span>
                        </div>
                        <p className="text-[12px] leading-relaxed text-[var(--ink-secondary)]">{sug.reason}</p>
                      </div>
                      {sug.action_view && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            onNavigate(sug.action_view);
                            onClose();
                          }}
                          className="shrink-0"
                        >
                          <span>Open</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </section>

        {/* Conversational Q&A */}
        <section className="space-y-3">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[var(--ink-muted)]">
            Ask Ollama Copilot About Your PRs, CI &amp; Tasks
          </div>

          <div className="flex flex-wrap gap-1.5">
            {QUICK_PROMPTS.map((qp) => (
              <button
                key={qp}
                type="button"
                onClick={() => handleSend(qp)}
                disabled={sending}
                className="rounded-lg border bg-[var(--surface-elevated)] px-2.5 py-1.5 text-[11.5px] font-medium text-[var(--ink-secondary)] hover:border-[var(--accent-bright)] hover:text-[var(--ink)] cursor-pointer transition-colors disabled:opacity-50"
              >
                {qp}
              </button>
            ))}
          </div>

          <div className="thin-scroll max-h-[260px] space-y-2.5 overflow-y-auto rounded-xl border bg-[var(--input-bg)] p-3.5">
            {messages.length === 0 ? (
              <div className="py-6 text-center text-[12px] text-[var(--ink-muted)]">
                Ask anything — Copilot automatically inspects your live GitHub PR telemetry, tasks, and alerts.
              </div>
            ) : (
              messages.map((m, idx) => (
                <div
                  key={idx}
                  className={cn(
                    'rounded-xl border p-3 text-[12.5px] leading-relaxed',
                    m.role === 'user'
                      ? 'ml-8 border-[color:var(--accent-bright)]/35 bg-[var(--accent-soft)] text-[var(--ink)]'
                      : 'mr-4 bg-[var(--surface)] text-[var(--ink-secondary)]'
                  )}
                >
                  <div className="mb-1 flex items-center justify-between font-mono text-[10px] uppercase text-[var(--ink-muted)]">
                    <span>{m.role === 'user' ? 'You' : 'Ollama Copilot'}</span>
                    {m.source && <span>{m.source}</span>}
                  </div>
                  <div className="whitespace-pre-wrap">{m.content}</div>
                </div>
              ))
            )}
            {sending && (
              <div className="rounded-xl border bg-[var(--surface)] p-3 font-mono text-[11.5px] text-[var(--ink-muted)]">
                Generating response with local Ollama...
              </div>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about PR checks, next SymPy/SunPy fix, or proposal timing..."
              className="min-w-0 flex-1 rounded-xl border bg-[var(--input-bg)] px-3.5 py-2.5 text-[13px] text-[var(--ink)] outline-none focus:border-[var(--accent-bright)]"
            />
            <Button type="submit" variant="primary" disabled={sending || !input.trim()}>
              <Send className="h-3.5 w-3.5" />
              <span>Ask</span>
            </Button>
          </form>
        </section>
      </div>
    </Sheet>
  );
};
