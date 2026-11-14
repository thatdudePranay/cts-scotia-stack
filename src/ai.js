import Anthropic from "@anthropic-ai/sdk";

// Created lazily so the server starts fine with no API key (AI off).
let _client;
export const getClient = () => (_client ??= new Anthropic());

export const FAST = "claude-haiku-5-5";    // per-answer grading, chat
export const SMART = "claude-sonnet-5-5";  // quiz + lesson generation

export async function askJSON({ model, system, user, max_tokens = 1500 }) {
  const res = await getClient().messages.create({
    model, max_tokens, system,
    messages: [{ role: "user", content: user }],
  });
  const text = res.content.map(b => (b.type === "text" ? b.text : "")).join("");
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("No JSON in model response");
  return JSON.parse(match[0]);
}