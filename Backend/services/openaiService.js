const OpenAI = require('openai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Parse a voice transcript into structured task data using OpenAI.
 * Detects ambiguity and may return follow-up clarification questions.
 *
 * @param {string} transcript - Raw voice text
 * @param {string[]} [conversationHistory] - Previous messages for follow-up context
 * @returns {Promise<{title, description, dueDate, dueTime, priority, clarificationNeeded, clarificationQuestion}>}
 */
async function parseVoiceText(transcript, conversationHistory = []) {
  const today = new Date();
  const dateStr = today.toISOString().split('T')[0];
  const dayOfWeek = today.toLocaleDateString('en-US', { weekday: 'long' });
  const currentTime = today.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const systemPrompt = `You are a task extraction assistant. Today is ${dayOfWeek}, ${dateStr}. Current time is ${currentTime}.

Extract structured task data from the user's voice input.
Return a JSON object with these exact fields:
{
  "title": "short task title (max 80 chars)",
  "description": "longer description if any context was given, else empty string",
  "dueDate": "ISO 8601 date string (YYYY-MM-DD) or null if no date mentioned",
  "dueTime": "24-hour time string (HH:MM) or null if no specific time mentioned",
  "priority": "low" | "medium" | "high" (infer from urgency/language),
  "clarificationNeeded": true | false,
  "clarificationQuestion": "A friendly question asking the user for missing details, or empty string"
}

RULES FOR DATES AND TIMES:
- "next Friday" means the coming Friday from today.
- "tomorrow" means ${tomorrowStr}.
- "end of month" means the last day of the current month.
- "morning" = 09:00, "noon" = 12:00, "afternoon" = 14:00, "evening" = 18:00, "night" = 21:00.
- "at 5pm" = 17:00, "at 3:30" = 15:30.

CLARIFICATION RULES:
- If the user mentions a VAGUE time like "evening", "afternoon", "later" — set clarificationNeeded to true and ask for a specific time. Still fill dueTime with the approximate time (e.g. "evening" = "18:00").
- If the user says something like "till evening" or "by afternoon" — ask: "Could you specify the exact time in the [time period]? For now, I've set it to [approximate time]."
- If the user mentions a RELATIVE day without a date like "on Sunday" — and if it could mean this week or next week, ask for clarification.
- If the user provides a CLEAR TIME like "at 5pm" or "at 3:30 PM" — do NOT ask for clarification, set clarificationNeeded to false.
- If the user provides NO date or time at all (e.g. "buy groceries") — that's fine, set both to null, do NOT ask for clarification.
- If the user says "urgent" or "ASAP", set priority to "high".
- If no urgency clue, default to "medium".

Always return valid JSON only.`;

  // Build messages with conversation history for follow-ups
  const messages = [{ role: 'system', content: systemPrompt }];

  // Add conversation history if this is a follow-up
  for (const msg of conversationHistory) {
    messages.push(msg);
  }

  // Add current transcript
  messages.push({ role: 'user', content: transcript });

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0,
    response_format: { type: 'json_object' },
    messages,
  });

  return JSON.parse(response.choices[0].message.content);
}

module.exports = { parseVoiceText };
