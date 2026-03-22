const OpenAI = require('openai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const ACTION_KEYWORDS = [
  'study',
  'complete',
  'finish',
  'submit',
  'call',
  'meet',
  'prepare',
  'revise',
  'read',
  'write',
  'go',
  'buy',
  'pay',
  'send',
  'visit',
  'practice',
  'work',
  'clean',
  'review',
  'plan',
  'build',
  'make',
  'take',
  'bring',
  'record',
  'exercise',
  'learn',
  'attend',
  'check',
  'reply',
  'email',
  'message',
  'upload',
  'download',
];

function normalizeWords(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

function looksLikeNonsenseTranscript(transcript, title, refinedText) {
  const words = normalizeWords(transcript);

  if (words.length === 0) {
    return true;
  }

  const uniqueWords = new Set(words);
  const hasActionKeyword = words.some((word) => ACTION_KEYWORDS.includes(word));
  const textMatchesModelOutput =
    transcript.trim().toLowerCase() === title.trim().toLowerCase() ||
    transcript.trim().toLowerCase() === refinedText.trim().toLowerCase();

  // Repeated filler like "falana dhimkana falana dhimkana" or "yo yo"
  const highlyRepetitive = words.length >= 2 && uniqueWords.size <= Math.max(1, Math.floor(words.length / 3));
  const veryShortWithoutIntent = words.length <= 4 && !hasActionKeyword;

  return (textMatchesModelOutput && veryShortWithoutIntent) || highlyRepetitive;
}

function buildFallbackClarification(transcript) {
  const cleaned = transcript.trim();
  if (!cleaned) {
    return 'What task do you want to add? Say something like "Study chemistry today at 5 PM".';
  }

  return `I heard "${cleaned}". What task do you want to add? You can say something like "Finish chemistry today by 6 PM".`;
}

/**
 * Parse a voice transcript into structured task data using OpenAI.
 * Detects ambiguity and may return follow-up clarification questions.
 *
 * @param {string} transcript - Raw voice text
 * @param {string[]} [conversationHistory] - Previous messages for follow-up context
 * @returns {Promise<{title, description, dueDate, dueTime, priority, clarificationNeeded, clarificationQuestion, refinedText, missingFields}>}
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
Normalize rough phrasing, broken grammar, and speech-to-text mistakes before understanding intent.
Examples:
- "chemistry toda done" should become a chemistry task for today
- "meting tomoro 5 evng" should become a meeting tomorrow and ask for an exact time if needed
- "yo" or unrelated text is not a task and needs clarification

Return a JSON object with these exact fields:
{
  "title": "short task title (max 80 chars)",
  "description": "a useful action-oriented description sentence",
  "dueDate": "ISO 8601 date string (YYYY-MM-DD)",
  "dueTime": "24-hour time string (HH:MM) or null if no specific time mentioned",
  "priority": "low" | "medium" | "high" (infer from urgency/language),
  "clarificationNeeded": true | false,
  "clarificationQuestion": "A friendly question asking the user for missing details, or empty string",
  "refinedText": "one polished natural-language restatement of the task",
  "missingFields": ["title" | "dueDate" | "dueTime"]
}

RULES FOR DATES AND TIMES:
- "next Friday" means the coming Friday from today.
- "tomorrow" means ${tomorrowStr}.
- "today", "tonight", "by end of day" should use ${dateStr}.
- If the user does not mention any date, default dueDate to ${dateStr}.
- "end of month" means the last day of the current month.
- "morning" = 09:00, "noon" = 12:00, "afternoon" = 14:00, "evening" = 18:00, "night" = 21:00.
- "at 5pm" = 17:00, "at 3:30" = 15:30.

CLARIFICATION RULES:
- If the user mentions a VAGUE time like "evening", "afternoon", "later" — set clarificationNeeded to true and ask for a specific time. Still fill dueTime with the approximate time (e.g. "evening" = "18:00").
- If the user gives a date like today or tomorrow but no exact time, ask what time they want to finish it by.
- If the user gives no date and no time but the task is valid, keep dueDate as ${dateStr} and ask for time only when the task sounds time-bound.
- If the user says something like "till evening" or "by afternoon" — ask: "Could you specify the exact time in the [time period]? For now, I've set it to [approximate time]."
- If the user mentions a RELATIVE day without a date like "on Sunday" — and if it could mean this week or next week, ask for clarification.
- If the user provides a CLEAR TIME like "at 5pm" or "at 3:30 PM" — do NOT ask for clarification, set clarificationNeeded to false.
- If the user provides NO date or time at all (e.g. "buy groceries") — set dueDate to ${dateStr} and do NOT ask for clarification unless the request clearly needs a time.
- If the task is clearly actionable but the wording is messy, infer the intended task instead of asking to repeat the same thing.
- If the input is not actionable or is just casual text, ask what task they want to add and include "title" in missingFields.
- If the user says "urgent" or "ASAP", set priority to "high".
- If no urgency clue, default to "medium".
- Always write a description even if the user said only a few words.
- "refinedText" should read like a clean version of what the user meant to say.
- If clarification is needed, keep the question short and conversational.

Always return valid JSON only.`;

  // Build messages with conversation history for follow-ups
  const messages = [{ role: 'system', content: systemPrompt }];

  // Add conversation history if this is a follow-up
  for (const msg of conversationHistory) {
    messages.push(msg);
  }

  // Add current transcript
  messages.push({ role: 'user', content: transcript });

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0,
      response_format: { type: 'json_object' },
      messages,
    });

    const parsed = JSON.parse(response.choices[0].message.content);

    const title = parsed.title || '';
    const refinedText = parsed.refinedText || parsed.title || transcript.trim();
    const dueDate = parsed.dueDate || dateStr;
    const dueTime = parsed.dueTime || null;
    const missingFields = Array.isArray(parsed.missingFields) ? parsed.missingFields : [];

    let clarificationNeeded = Boolean(parsed.clarificationNeeded);
    let clarificationQuestion = parsed.clarificationQuestion || '';

    const normalizedContent = `${transcript} ${title} ${refinedText}`.toLowerCase();
    const timeSensitiveIntent =
      /(done|finish|complete|submit|turn in|deadline|due|by|before|till|until)/.test(
        normalizedContent
      ) || dueDate === dateStr || dueDate === tomorrowStr;

    if (looksLikeNonsenseTranscript(transcript, title, refinedText)) {
      return {
        title: '',
        description: '',
        dueDate: dateStr,
        dueTime: null,
        priority: 'medium',
        clarificationNeeded: true,
        clarificationQuestion:
          'I could not understand a real task there. What do you want to do, and by when should I set it?',
        refinedText: transcript.trim(),
        missingFields: ['title', 'dueTime'],
      };
    }

    if (title && dueDate && !dueTime && timeSensitiveIntent) {
      clarificationNeeded = true;
      clarificationQuestion =
        clarificationQuestion ||
        `What time do you want to complete "${title}" by?`;

      if (!missingFields.includes('dueTime')) {
        missingFields.push('dueTime');
      }
    }

    return {
      title,
      description: parsed.description || '',
      dueDate,
      dueTime,
      priority: parsed.priority || 'medium',
      clarificationNeeded,
      clarificationQuestion,
      refinedText,
      missingFields,
    };
  } catch (error) {
    return {
      title: '',
      description: '',
      dueDate: null,
      dueTime: null,
      priority: 'medium',
      clarificationNeeded: true,
      clarificationQuestion: buildFallbackClarification(transcript),
      refinedText: transcript.trim(),
      missingFields: ['title'],
    };
  }
}

module.exports = { parseVoiceText };
