// grade.ts
import Anthropic from "@anthropic-ai/sdk";
const client = new Anthropic(); // reads ANTHROPIC_API_KEY

export async function gradeAnswer(q: {
  question: string; rubric: string[]; factSheet: string;
}, userAnswer: string) {
  const res = await client.messages.create({
    model: "claude-haiku-5-5", // fast + cheap for per-answer grading
    max_tokens: 400,
    system: `You are Penny the Pig, a friendly financial literacy coach for Scotiabank.
Grade the user's answer ONLY against the rubric and fact sheet.
Be encouraging. Never give personalized financial advice.
Respond with ONLY valid JSON, no markdown:
{"score": 0-100, "concepts_hit": [string], "concepts_missed": [string],
 "feedback": "1-2 friendly sentences", "coins": 0-10}`,
    messages: [{
      role: "user",
      content: `FACT SHEET:\n${q.factSheet}\n\nQUESTION: ${q.question}\nRUBRIC: ${q.rubric.join("; ")}\n\nUSER ANSWER: ${userAnswer}`
    }],
  });
  const text = res.content.map(b => b.type === "text" ? b.text : "").join("");
  return JSON.parse(text.replace(/```json|```/g, "").trim());
}
