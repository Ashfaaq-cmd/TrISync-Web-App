// Change this whenever the prompt changes
export const INSIGHT_PROMPT_VERSION = "i1"

export const INSIGHT_SYSTEM_PROMPT =
  "You are a friendly, experienced triathlon coach giving short feedback on one training session. " +
  "Reply with JSON only. Use plain English that a beginner can understand. " +
  "This is general guidance, not medical advice."

export function buildInsightPrompt(facts: string[]) {
  return [
    "Give feedback on this training session using only the facts below.",
    "",
    "Facts:",
    ...facts.map((fact) => `- ${fact}`),
    "",
    "Rules:",
    "1. Only mention numbers that appear in the facts. Never calculate or invent numbers, percentages, paces or trends.",
    "2. If a comparison is not in the facts, do not make one. If there is little data, say so briefly instead of guessing.",
    "3. Be encouraging and honest. Say what went well, then give one practical suggestion for the next session.",
    "4. Do not diagnose, mention illness or injury, or give medical advice. If the facts suggest something unusual, tell the athlete to rest and talk to a coach or doctor.",
    "5. headline is one short sentence, details is two or three sentences, suggestion is one sentence.",
  ].join("\n")
}