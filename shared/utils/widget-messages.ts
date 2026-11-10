type Messages = Record<string, unknown>
const isMessages = (value: unknown): value is Messages => !!value && typeof value === 'object' && !Array.isArray(value)

// The app root's widget text over this layer's: a deep merge where the override wins.
export function mergeWidgetMessages(base: Messages, override?: Messages): Messages {
  const merged = { ...base }
  for (const [key, value] of Object.entries(override ?? {})) {
    const current = merged[key]
    merged[key] = isMessages(current) && isMessages(value) ? mergeWidgetMessages(current, value) : value
  }
  return merged
}
