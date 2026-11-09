// A host's prefill for a new widget conversation: non-empty text, cut to the limit.
export const WIDGET_COMPOSE_MAX = 2000

export function composeText(payload: unknown): string | null {
  const text = (payload as { text?: unknown } | null | undefined)?.text
  return typeof text === 'string' && text.trim() ? text.slice(0, WIDGET_COMPOSE_MAX) : null
}
