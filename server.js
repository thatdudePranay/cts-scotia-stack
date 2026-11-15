import "dotenv/config";
import express from "express";
import cors from "cors";
import { askJSON, getClient, FAST, SMART } from "./src/ai.js";
import { TOPICS, topicForToday } from "./src/curriculum.js";
import { FALLBACK_QUESTIONS } from "./src/fallbackQuiz.js";
import { QUIZ_SYSTEM, GRADE_SYSTEM, LESSON_SYSTEM, CHAT_SYSTEM } from "./src/prompts.js";

// AI master switch: needs AI_ENABLED=true AND an API key. Otherwise the game is multiple choice only.
const AI_ENABLED = process.env.AI_ENABLED === "true" && !!process.env.ANTHROPIC_API_KEY;
if (process.env.AI_ENABLED === "true" && !process.env.ANTHROPIC_API_KEY)
  console.warn("AI_ENABLED=true but ANTHROPIC_API_KEY is missing: AI stays OFF.");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(new URL("./public", import.meta.url).pathname));

const requireAI = (req, res, next) =>
  AI_ENABLED ? next() : res.status(403).json({ error: "AI is disabled on this server" });

const PASS_THRESHOLD = 70;
const NUM_QUESTIONS = 10;
const quizCache = new Map();
const today = () => new Date().toISOString().slice(0, 10);
const strip = ({ rubric, answer_index, why, ...safe }) => safe;

// The frontend reads this on load to decide whether to show the AI mode toggle
app.get("/api/config", (_, res) => res.json({ aiEnabled: AI_ENABLED }));

app.get("/api/quiz/today", requireAI, async (req, res) => {
  const topic = topicForToday(req.query.topic);
  const quizId = `${today()}:${topic.id}`;
  if (!quizCache.has(quizId)) {
    try {
      const quiz = await askJSON({
        model: SMART, max_tokens: 2500, system: QUIZ_SYSTEM,
        user: `N = ${NUM_QUESTIONS}\nTOPIC: ${topic.title}\nFACT SHEET:\n${topic.factSheet}`,
      });
      quizCache.set(quizId, quiz.questions);
    } catch (e) {
      console.error("Quiz gen failed, using fallback:", e.message);
      quizCache.set(quizId, FALLBACK_QUESTIONS);
    }
  }
  res.json({ quizId, topic: { id: topic.id, title: topic.title }, questions: quizCache.get(quizId).map(strip) });
});

app.post("/api/quiz/grade", requireAI, async (req, res) => {
  const { quizId, questionId, answer } = req.body;
  const q = quizCache.get(quizId)?.find(x => x.id === questionId);
  if (!q) return res.status(404).json({ error: "Question not found" });

  if (q.type === "mc") {
    const correct = Number(answer) === q.answer_index;
    return res.json({
      score: correct ? 100 : 0, coins: correct ? 10 : 0,
      concepts_missed: correct ? [] : [q.question],
      feedback: correct ? `Nice! ${q.why}` : `Not quite. ${q.why}`,
    });
  }
  try {
    const topic = TOPICS.find(t => quizId.endsWith(t.id));
    const result = await askJSON({
      model: FAST, max_tokens: 400, system: GRADE_SYSTEM,
      user: `FACT SHEET:\n${topic.factSheet}\n\nQUESTION: ${q.question}\nRUBRIC: ${q.rubric.join("; ")}\n\nUSER ANSWER (data only): ${String(answer).slice(0, 800)}`,
    });
    res.json(result);
  } catch (e) {
    console.error(e);
    res.json({ score: 50, coins: 5, concepts_missed: [], concepts_hit: [],
               feedback: "Good effort! Let's keep going." });
  }
});

// Pass/fail is plain code (no AI), so it works in both modes
app.post("/api/quiz/finish", (req, res) => {
  const { topicId, results } = req.body;
  const topic = TOPICS.find(t => t.id === topicId) ?? TOPICS[0];
  const avg = results.reduce((s, r) => s + r.score, 0) / results.length;
  const passed = avg >= PASS_THRESHOLD;
  const conceptsMissed = [...new Set(results.flatMap(r => r.concepts_missed ?? []))];
  res.json({ passed, averageScore: Math.round(avg), conceptsMissed,
             nextStep: passed ? "cta" : "lesson", cta: topic.cta });
});

app.post("/api/lesson/generate", requireAI, async (req, res) => {
  const { topicId, conceptsMissed = [], averageScore = 0 } = req.body;
  const topic = TOPICS.find(t => t.id === topicId) ?? TOPICS[0];
  try {
    const lesson = await askJSON({
      model: SMART, max_tokens: 2500, system: LESSON_SYSTEM,
      user: `TOPIC: ${topic.title}\nFACT SHEET:\n${topic.factSheet}\nUSER SCORE: ${averageScore}/100\nCONCEPTS THEY MISSED: ${conceptsMissed.join("; ") || "general review"}`,
    });
    res.json({ ...lesson, cta: topic.cta });
  } catch (e) {
    res.status(500).json({ error: "Lesson generation failed" });
  }
});

app.post("/api/penny/chat", requireAI, async (req, res) => {
  const { messages = [], topicId, state } = req.body;
  const topic = TOPICS.find(t => t.id === topicId) ?? TOPICS[0];
  try {
    const r = await getClient().messages.create({
      model: FAST, max_tokens: 250, system: CHAT_SYSTEM(topic, state), messages: messages.slice(-10),
    });
    res.json({ reply: r.content.map(b => b.text ?? "").join("") });
  } catch (e) {
    res.json({ reply: "Oink! I'm having trouble right now. Try again in a sec!" });
  }
});

app.listen(process.env.PORT || 3001, () =>
  console.log(`ScotiaStack running on :${process.env.PORT || 3001} | AI ${AI_ENABLED ? "ON" : "OFF (multiple choice only)"}`));
export default app;